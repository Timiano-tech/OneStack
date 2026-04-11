# OneStack – Technical Build Spec

> **Stack:** Next.js 16 (App Router) · Supabase (PostgreSQL + Auth + Storage) · Tailwind CSS v4 · TypeScript

This document is the single source of truth for setting up and extending the OneStack backend.

---

## 1. Architecture Overview

```
┌─────────────────────────────────┐
│         Next.js 16 Frontend     │
│  src/app/ (App Router)          │
│  src/views/ (Page components)   │
│  src/components/ (UI)           │
│  src/contexts/ (Auth, Theme)    │
│  src/services/ (DB helpers)     │
└────────────┬────────────────────┘
             │ @supabase/supabase-js
┌────────────▼────────────────────┐
│           Supabase              │
│  ├── Auth (email + Google OAuth)│
│  ├── PostgreSQL (public schema) │
│  └── Storage (photos bucket)    │
└─────────────────────────────────┘
```

**Key files:**
| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client singleton |
| `src/contexts/AuthContext.tsx` | Auth state, session, profile merge |
| `src/services/listingService.ts` | CRUD for listings |
| `src/services/feedService.ts` | Posts, comments, likes, saves |
| `src/services/userService.ts` | Profile sync & image upload |
| `src/services/chatService.ts` | Real-time messaging & history |

---

## 2. Environment Variables

Add to `.env` (never commit real values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

To find these: **Supabase Dashboard → Project Settings → API**.

> The `NEXT_PUBLIC_` prefix is required by Next.js for values accessible in the browser.

---

## 3. Supabase Project Setup

- [ ] Create a project at [supabase.com](https://supabase.com)
- [ ] Copy Project URL and Anon Key into `.env`
- [ ] Enable **Email/Password** auth: Authentication → Providers → Email
- [ ] Enable **Google OAuth** (optional): Authentication → Providers → Google
  - Add redirect URL: `https://<your-domain>/auth/callback`
- [ ] Create Storage bucket named **`photos`** (set to **Public**)
- [ ] Run the SQL schema below in the SQL editor

---

## 4. Database Schema (PostgreSQL)

All tables live in the `public` schema. Column names use **snake_case** as stored in Postgres; the service layer maps them to camelCase for the TypeScript app.

### 4.1 `users`

Synced from Supabase Auth on sign-up. Primary key = auth `user.id` (UUID).

```sql
CREATE TABLE public.users (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT,
  display_name        TEXT NOT NULL,
  photo_url           TEXT,
  university_id       TEXT,
  campus_id           TEXT,
  is_verified_student BOOLEAN DEFAULT FALSE,
  trust_score         NUMERIC(3,1) DEFAULT 0,
  role                TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Matches `auth.users.id` |
| `email` | text | From auth provider |
| `display_name` | text | Public name |
| `photo_url` | text | Avatar (Storage public URL) |
| `university_id` | text | FK reference (or seed data) |
| `campus_id` | text | FK reference – used for campus-scoped visibility |
| `is_verified_student` | boolean | Admin-set verified badge |
| `trust_score` | numeric | 0–5 rating average |
| `role` | text | `user` \| `admin` \| `moderator` |

#### Auto-create on sign-up (trigger)

When a user signs up via Supabase Auth, a PostgreSQL trigger automatically creates the corresponding row in `public.users`. Run this in the **SQL Editor**:

```sql
-- Function: copy new auth user into public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    display_name,
    photo_url,
    university_id,
    campus_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    -- pull display_name from the metadata passed during signUp()
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    -- Google OAuth provides a picture field
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NEW.raw_user_meta_data->>'university_id',
    NEW.raw_user_meta_data->>'campus_id'
  )
  ON CONFLICT (id) DO NOTHING;  -- safe to re-run / idempotent

  RETURN NEW;
END;
$$;

-- Trigger: fire after every new row in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
```

> **How it works:** When `supabase.auth.signUp()` is called from the app, the `options.data` object (containing `display_name`, `university_id`, `campus_id`) is stored in `auth.users.raw_user_meta_data`. The trigger reads those fields and populates `public.users` automatically — no manual `syncUserToSupabase()` call required for new sign-ups.

> **Google OAuth:** The trigger also handles Google sign-in automatically. Google provides `picture` in the metadata, which is mapped to `photo_url`.

---

### 4.2 `listings`

```sql
CREATE TABLE public.listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'service')),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  price         NUMERIC(12,2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'USD',
  category      TEXT NOT NULL,
  condition     TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'for_parts')),
  images        TEXT[] DEFAULT '{}',
  location      TEXT,
  campus_id     TEXT,
  university_id TEXT,
  is_premium    BOOLEAN DEFAULT FALSE,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed', 'pending')),
  view_count    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX listings_campus_status_idx ON public.listings (campus_id, status, created_at DESC);
CREATE INDEX listings_user_idx          ON public.listings (user_id, created_at DESC);
CREATE INDEX listings_category_idx      ON public.listings (campus_id, category, created_at DESC);
```

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | Seller — FK to `users` |
| `type` | text | `buy` / `sell` / `service` |
| `images` | text[] | Array of Storage public URLs |
| `campus_id` | text | Used for campus-only visibility filter |
| `is_premium` | boolean | Boosted to top of feed |
| `status` | text | `active` / `sold` / `removed` / `pending` |

---

### 4.3 `posts`

Social feed posts.

```sql
CREATE TABLE public.posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campus_id       TEXT,
  university_id   TEXT,
  content         TEXT NOT NULL,
  images          TEXT[] DEFAULT '{}',
  category        TEXT DEFAULT 'General',
  hashtags        TEXT[] DEFAULT '{}',
  visibility      TEXT DEFAULT 'campus' CHECK (visibility IN ('campus', 'university', 'public')),
  like_count      INT DEFAULT 0,
  comment_count   INT DEFAULT 0,
  share_count     INT DEFAULT 0,
  save_count      INT DEFAULT 0,
  trending_score  INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX posts_campus_feed_idx ON public.posts (campus_id, created_at DESC);
CREATE INDEX posts_trending_idx    ON public.posts (campus_id, trending_score DESC, created_at DESC);
```

**Trending score weights** (applied in `feedService.ts`):
| Action | Delta |
|--------|-------|
| Like | +2 |
| Comment | +3 |
| Save | +5 |

---

### 4.4 `comments`

```sql
CREATE TABLE public.comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  like_count        INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX comments_post_idx ON public.comments (post_id, created_at ASC);
```

`parent_comment_id` is `NULL` for root comments, set for threaded replies.

---

### 4.5 `likes`

```sql
CREATE TABLE public.likes (
  id         TEXT PRIMARY KEY, -- format: "{post_id}_{user_id}"
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

> The composite text ID `{post_id}_{user_id}` enforces one like per user per post at the DB level without needing a unique constraint.

---

### 4.6 `saves`

```sql
CREATE TABLE public.saves (
  id         TEXT PRIMARY KEY, -- format: "{post_id}_{user_id}"
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.7 `reports`

```sql
CREATE TABLE public.reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_id   TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('post', 'comment', 'listing', 'user')),
  reason      TEXT NOT NULL,
  description TEXT DEFAULT '',
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX reports_status_idx ON public.reports (status, created_at DESC);

---

### 4.8 `conversations`

High-level chat metadata.

```sql
CREATE TABLE public.conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participants  UUID[] NOT NULL,  -- stores [user1_id, user2_id]
  listing_id    UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  last_message  TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching conversations where I am a participant
CREATE INDEX conversations_participants_idx ON public.conversations USING GIN (participants);
```

---

### 4.9 `messages`

Individual chat messages.

```sql
CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  read_at         TIMESTAMPTZ, -- NULL if unread
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX messages_convo_idx ON public.messages (conversation_id, created_at ASC);
```
```

---

## 5. Row Level Security (RLS)

Enable RLS on every table. Run these in the **SQL Editor**.

```sql
-- Enable RLS
ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages      ENABLE ROW LEVEL SECURITY;

-- Helper functions (security definer avoids infinite recursion)
-- ... [existing is_admin / is_moderator codes] ...

-- ... [existing users/listings/posts/comments policies] ...

-- conversations (users see convos they belong to)
CREATE POLICY "conversations_select" ON public.conversations
  FOR SELECT USING (auth.uid() = ANY(participants));

-- messages (users read/send in their convos)
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND auth.uid() = ANY(participants)
    )
  );

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND auth.uid() = ANY(participants)
    )
  );
```

---

## 6. Supabase Storage

### 6.1 Bucket

| Bucket name | Visibility | Purpose |
|------------|-----------|---------|
| `photos` | **Public** | All images (posts, listings, avatars) |

Create via: **Dashboard → Storage → New bucket → `photos` → Public: ✓**

### 6.2 Folder structure

```
photos/
├── posts/{userId}/{timestamp}_{random}.jpg      ← compressed ≤1080px (canvas)
├── listings/{userId}/{timestamp}_{random}.jpg
└── avatars/{userId}/avatar.jpg                  ← overwritten on re-upload
```

### 6.3 Storage Policies

```sql
-- Authenticated users can upload
CREATE POLICY "photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Anyone can read
CREATE POLICY "photos_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

-- Users can delete files in their own sub-folder
CREATE POLICY "photos_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
```

---

## 7. Authentication Flow

```
Register (email + password)
  └─► supabase.auth.signUp({ email, password, options: { data: { display_name, ... } } })
  └─► syncUserToSupabase()  →  upsert into public.users

Login
  └─► supabase.auth.signInWithPassword({ email, password })
                  OR
  └─► supabase.auth.signInWithOAuth({ provider: 'google' })
  └─► AuthContext.fetchProfile()  →  SELECT * FROM users WHERE id = auth.uid()
  └─► Merge auth.User + UserProfile row → React state
```

**`AuthContext`** exposes:
| Property | Type | Description |
|----------|------|-------------|
| `user` | `(User & UserProfile) \| null` | Merged auth + DB profile |
| `loading` | `boolean` | True while session resolves |
| `logout()` | `() => Promise<void>` | Calls `supabase.auth.signOut()` |

---

## 8. Service Layer Reference

### `listingService.ts`

| Function | Description |
|----------|-------------|
| `getListings(filters?)` | Fetch listings filtered by `campusId`, `category`, `type`, text `query` |
| `getListingById(id)` | Single listing by UUID |
| `createListing(data, files?)` | Upload images → insert listing row |
| `uploadListingImages(userId, files)` | Upload to `photos/listings/{userId}/` |

### `feedService.ts`

| Function | Description |
|----------|-------------|
| `getFeedPosts({ campusId, category, isTrending, lastPage })` | Paginated posts with joined `author` |
| `createPost({ userId, content, imageFiles, ... })` | Compress + upload images, insert post |
| `toggleLike(postId, userId)` | Upsert/delete `likes`, update `like_count` + `trending_score` |
| `toggleSavePost(postId, userId)` | Upsert/delete `saves`, update `save_count` + `trending_score` |
| `addComment(postId, userId, content, parentId?)` | Insert comment, increment `comment_count` |
| `getComments(postId)` | Fetch comments with author join |
| `deletePost(postId)` | Delete post (cascades to comments, likes, saves) |
| `deleteComment(commentId, postId)` | Delete comment, decrement `comment_count` |
| `reportContent(reporterId, targetId, type, reason)` | Insert into `reports` |

### `chatService.ts`

| Function | Description |
|----------|-------------|
| `getConversations(userId)` | Fetch all chats for a user with secondary profiles |
| `getMessages(convoId)` | Fetch conversation history (asc by date) |
| `sendMessage(convoId, senderId, content)` | Send message + update convo metadata |
| `markAsRead(convoId, userId)` | Update `read_at` for messages sent by others |
| `getOrCreateConversation(myId, otherId, listingId?)` | Fetch existing or create new thread |
| `subscribeToMessages(convoId, callback)` | Real-time message listener |

### `userService.ts`

| Function | Description |
|----------|-------------|
| `syncUserToSupabase(authUser, extras?)` | Upsert into `public.users` on sign-up/sign-in |
| `updateUserProfileImage(authUser, file)` | Upload to `photos/avatars/{userId}/avatar.jpg`, update `photo_url` |

---

## 9. Routing Architecture (Next.js App Router)

```
src/app/
├── layout.tsx                    ← Root layout: Providers (Auth, Theme, Toast)
├── template.tsx                  ← Framer Motion page transitions
├── (main)/                       ← Route group: Navbar + BottomNav layout
│   ├── layout.tsx
│   ├── page.tsx                  → /            Home
│   ├── feed/page.tsx             → /feed        Social feed
│   ├── listings/page.tsx         → /listings    Marketplace browse
│   ├── listing/
│   │   ├── [id]/page.tsx         → /listing/:id Listing detail
│   │   └── create/page.tsx       → /listing/create
│   ├── chat/page.tsx             → /chat
│   ├── profile/
│   │   ├── page.tsx              → /profile     Own profile
│   │   └── [userId]/page.tsx     → /profile/:userId
│   └── pricing/page.tsx          → /pricing
├── (admin)/                      ← Route group: Admin sidebar layout
│   ├── layout.tsx
│   └── admin/
│       ├── page.tsx              → /admin
│       ├── users/page.tsx        → /admin/users
│       ├── listings/page.tsx     → /admin/listings
│       ├── reports/page.tsx      → /admin/reports
│       └── analytics/page.tsx    → /admin/analytics
├── login/page.tsx                → /login
├── register/page.tsx             → /register
└── forgot-password/page.tsx      → /forgot-password
```

> Page components live in `src/views/`. The thin `page.tsx` files in `src/app/` simply re-export them: `export default function FeedPage() { return <Feed />; }`

---

## 10. Setup Checklist

| Area | Action |
|------|--------|
| **Supabase project** | Create at supabase.com; copy URL + anon key to `.env` |
| **Auth** | Enable Email/Password; optionally enable Google OAuth |
| **Database** | Run all DDL from Section 4 in the SQL editor |
| **RLS** | Run all policies from Section 5 |
| **Storage** | Create `photos` bucket (Public); run storage policies from Section 6 |
| **Admin role** | Manually set `role = 'admin'` in `public.users` for admin accounts |
| **Google OAuth** | Add your domain to allowed redirect URLs in Supabase Auth settings |

---

## 11. Recommended Next Steps

- [ ] **Atomic counters** — Replace manual `like_count` / `comment_count` increments with PostgreSQL triggers to prevent race conditions under concurrent load.
- [x] **Real-time chat** — Use `supabase.channel()` with `postgres_changes` on a dedicated `messages` table for live messaging.
- [ ] **Push notifications** — Integrate via a Supabase Edge Function calling the Web Push API or a third-party service.
- [ ] **Image optimization** — Replace raw `<img>` tags with Next.js `<Image />` for automatic WebP, resizing, and lazy loading.
- [ ] **Verified students** — Add email-domain validation on registration (e.g. `.edu` suffix) to auto-set `is_verified_student = true`.
- [ ] **Premium expiry** — Add a `premium_until TIMESTAMPTZ` column to `listings`; run a scheduled Supabase function to flip `is_premium = false` on expiry.
