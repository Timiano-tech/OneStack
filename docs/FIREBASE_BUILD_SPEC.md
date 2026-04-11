# ~~OneStack – Firebase Build Spec~~ [DEPRECATED]

> ⚠️ **This document is outdated.** OneStack has been migrated from Firebase to **Supabase + Next.js**.
> 
> The current technical specification is in **[BUILD_SPEC.md](./BUILD_SPEC.md)**.
>
> This file is kept for historical reference only. Do not use it for new development.

---


## 1. Firebase project setup

- [ ] Create a Firebase project (or use existing) at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Add a **Web** app; copy config into `.env` (see `.env.example`)
- [ ] Enable **Authentication** → Sign-in methods:
  - **Email/Password** (enable)
  - **Phone** (enable; optional for SMS verification)
- [ ] Create **Firestore Database** (production or test mode initially)
- [ ] Create **Storage** bucket (same project)
- [ ] (Optional) Enable **Cloud Messaging** for push; note **Sender ID** and use in VAPID key later

---

## 2. Firestore collections

Structure and field names aligned with `src/types.ts`.

### 2.1 `universities` (top-level)

Reference data; can be seeded by admin or via a script.

| Field        | Type   | Description                    |
|-------------|--------|--------------------------------|
| `name`      | string | University name                |
| `country`   | string | Country code or name           |
| `createdAt`| string | ISO date                       |

- **Document ID**: use a stable id (e.g. `uni_demo_01`).

### 2.2 `campuses` (top-level)

| Field          | Type   | Description     |
|----------------|--------|-----------------|
| `universityId` | string | FK to universities |
| `name`         | string | Campus name     |
| `city`         | string | (optional)      |
| `createdAt`    | string | ISO date        |

- **Document ID**: e.g. `campus_01`.
- **Query**: by `universityId` to show campuses in registration.

### 2.3 `users` (top-level)

One document per user; **document ID = Firebase Auth UID**.

| Field             | Type    | Description                          |
|-------------------|---------|--------------------------------------|
| `email`           | string  | (optional if phone-only)            |
| `phone`           | string  | (optional)                          |
| `displayName`     | string  | Required                             |
| `photoURL`        | string  | (optional) Storage URL               |
| `universityId`    | string  | Required                             |
| `campusId`        | string  | Required                             |
| `isVerifiedStudent` | boolean | Verified student badge            |
| `trustScore`      | number  | 0–5; computed from reviews          |
| `role`            | string  | `user` \| `admin` \| `moderator`     |
| `fcmTokens`       | map     | (optional) `{ [token: string]: number }` for push |
| `createdAt`       | string  | ISO date                             |
| `updatedAt`       | string  | ISO date                             |

- Create/update from client after sign-up/sign-in, or via **Auth trigger** Cloud Function.
- Admin/verified: set via **Custom Claims** (Auth) and/or these fields; keep in sync if using both.

### 2.4 `listings` (top-level)

| Field         | Type     | Description                          |
|---------------|----------|--------------------------------------|
| `userId`      | string   | Auth UID of seller                   |
| `type`        | string   | `buy` \| `sell` \| `service`         |
| `title`       | string   |                                      |
| `description` | string  |                                      |
| `price`       | number   |                                      |
| `currency`     | string  | e.g. `USD`                           |
| `category`     | string  | Item or service category             |
| `condition`    | string   | (optional) new, like_new, good, fair, for_parts |
| `images`      | array    | Array of Storage URLs                |
| `location`    | string   | Free text (e.g. “North Campus”)      |
| `campusId`    | string   | For campus-only visibility           |
| `universityId`| string   | For multi-university                 |
| `isPremium`   | boolean  | Boosted listing                      |
| `status`      | string   | `active` \| `sold` \| `removed` \| `pending` |
| `viewCount`   | number   | (optional)                           |
| `favoriteCount` | number | (optional)                           |
| `createdAt`   | string   | ISO date                             |
| `updatedAt`   | string   | ISO date                             |

- **Queries**: by `campusId` + `status` + `createdAt` (and filters like category, price). Create composite indexes as suggested in Section 6.

### 2.5 `chatRooms` (top-level)

One document per listing–buyer pair (or derive room id from `listingId` + `buyerId`).

| Field          | Type   | Description                |
|----------------|--------|----------------------------|
| `listingId`    | string | FK to listings             |
| `buyerId`      | string | Auth UID                  |
| `sellerId`     | string | Auth UID                  |
| `lastMessage`  | string | (optional) preview        |
| `lastMessageAt`| string | ISO date; for ordering    |
| `createdAt`    | string | ISO date                  |

- **Document ID**: e.g. `listingId_buyerId` or a generated id; ensure one room per (listing, buyer).

### 2.6 `messages` (subcollection: `chatRooms/{roomId}/messages`)

| Field      | Type    | Description   |
|------------|---------|---------------|
| `senderId` | string  | Auth UID      |
| `text`     | string  |               |
| `createdAt`| string  | ISO date      |
| `read`     | boolean |               |

- **Document ID**: auto-generated.
- **Query**: order by `createdAt` for chat history.

### 2.7 `favorites` (top-level)

| Field       | Type   | Description |
|-------------|--------|-------------|
| `userId`    | string | Auth UID    |
| `listingId`| string |             |
| `createdAt`| string | ISO date    |

- **Document ID**: e.g. `userId_listingId` to enforce one favorite per user per listing.
- **Query**: by `userId` for “my favorites”; optionally by `listingId` for count.

### 2.8 `reviews` (top-level)

| Field       | Type   | Description        |
|-------------|--------|--------------------|
| `listingId`| string | (optional)         |
| `reviewerId`| string | Auth UID          |
| `revieweeId`| string | User being reviewed (seller) |
| `rating`   | number | 1–5                |
| `comment`  | string | (optional)         |
| `createdAt`| string | ISO date           |

- **Query**: by `revieweeId` to compute `trustScore` (e.g. in a Cloud Function).

### 2.9 `reports` (top-level)

| Field        | Type   | Description                          |
|--------------|--------|--------------------------------------|
| `reporterId` | string | Auth UID                             |
| `type`       | string | `listing` \| `user` \| `message`     |
| `targetId`   | string | ID of listing, user, or message      |
| `reason`     | string | e.g. spam, fraud, inappropriate     |
| `description`| string | (optional)                           |
| `status`     | string | `pending` \| `reviewed` \| `resolved` \| `dismissed` |
| `reviewedBy` | string | (optional) Admin UID                |
| `reviewedAt` | string | (optional) ISO date                 |
| `createdAt`  | string | ISO date                             |

- **Query**: by `status` for admin report queue.

---

## 3. Firestore security rules

Principles: **campus-only visibility** for listings; only admins/moders write to reports status; users can only write their own data.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }
    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }
    function isAdmin() {
      return isSignedIn() && request.auth.token.role == 'admin';
    }
    function isModerator() {
      return isSignedIn() && (request.auth.token.role == 'admin' || request.auth.token.role == 'moderator');
    }

    match /universities/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /campuses/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    match /listings/{listingId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update, delete: if isOwner(resource.data.userId) || isModerator();
    }

    match /chatRooms/{roomId} {
      allow read, write: if isSignedIn() && (
        resource.data.buyerId == request.auth.uid || resource.data.sellerId == request.auth.uid
      );
      allow create: if isSignedIn() && (
        request.auth.uid == request.resource.data.buyerId || request.auth.uid == request.resource.data.sellerId
      );
    }
    match /chatRooms/{roomId}/messages/{msgId} {
      allow read, create: if isSignedIn();
      allow update, delete: if isSignedIn();
    }

    match /favorites/{id} {
      allow read, write: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.userId;
    }

    match /reviews/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.reviewerId;
      allow update, delete: if isOwner(resource.data.reviewerId) || isAdmin();
    }

    match /reports/{id} {
      allow read: if isModerator() || (isSignedIn() && resource.data.reporterId == request.auth.uid);
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.reporterId;
      allow update: if isModerator(); // e.g. set status, reviewedBy
      allow delete: if isAdmin();
    }
  }
}
```

- Adjust `buyerId`/`sellerId` checks if you store them as single strings (e.g. `resource.data.buyerId == request.auth.uid`).
- **Custom claims**: set `role` and optionally `isVerifiedStudent` via Admin SDK or a Cloud Function on user create/verify.

---

## 4. Firebase Storage

### 4.1 Bucket structure

- **Listing images**: `listing-images/{listingId}/{imageId}.jpg`  
  - `imageId`: e.g. UUID or timestamp.
- **User avatars**: `user-avatars/{userId}/avatar.jpg` (one file per user, overwrite ok).

### 4.2 Storage security rules

- Only authenticated users.
- Users can upload/update/delete only under their own `userId` (listings: only if they own the listing).

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /listing-images/{listingId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      // Optional: restrict to listing owner via Firestore get
    }
    match /user-avatars/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

- For strict “listing owner only” uploads, use a Cloud Function that checks Firestore and then writes to Storage, or use **Firestore get()** in rules to read the listing and check `userId`.

---

## 5. Cloud Messaging (FCM) – push notifications

- [ ] In Firebase Console: **Project Settings → Cloud Messaging**; enable and note **Server key** / **Web Push certificates** (VAPID).
- [ ] In the app:
  - Request notification permission.
  - Get FCM token (e.g. `getToken(messaging, { vapidKey: '...' })`).
  - Save token to `users/{uid}.fcmTokens` (map of token → timestamp) so backend can target devices.
- [ ] **Send pushes** via:
  - **Cloud Functions**: on `messages` create → notify recipient; on listing activity (e.g. new message, favorite) → notify seller; optional scheduled “promotions”.
  - Or a backend you run that calls FCM HTTP v1 API.

Topics (optional): e.g. `campus_{campusId}` for campus-wide promos; users subscribe on app load.

---

## 6. Firestore indexes

Create composite indexes for main queries (Firestore will prompt in console when a query fails, or add in **Firestore → Indexes**).

| Collection  | Fields (order)                    | Query use                          |
|------------|-----------------------------------|------------------------------------|
| listings   | `campusId` Asc, `status` Asc, `createdAt` Desc | Campus feed, active first          |
| listings   | `campusId` Asc, `category` Asc, `createdAt` Desc | Filter by category                 |
| listings   | `userId` Asc, `createdAt` Desc    | User’s own listings                |
| chatRooms  | `buyerId` Asc, `lastMessageAt` Desc | Buyer’s conversations              |
| chatRooms  | `sellerId` Asc, `lastMessageAt` Desc | Seller’s conversations            |
| messages   | `createdAt` Asc                   | Chat history (subcollection)       |
| favorites  | `userId` Asc, `createdAt` Desc    | User’s favorites                   |
| reviews    | `revieweeId` Asc, `createdAt` Desc| Seller’s reviews for trustScore    |
| reports    | `status` Asc, `createdAt` Desc   | Admin report queue                 |

---

## 7. Cloud Functions (optional but recommended)

- **Auth onCreate**: create `users/{uid}` with defaults (universityId/campusId from registration payload or empty), set custom claims from admin if needed.
- **Auth onDelete**: delete or anonymize `users/{uid}`, clean FCM tokens.
- **Firestore `listings` onCreate**: set `createdAt`/`updatedAt` if not set; optional: notify campus topic.
- **Firestore `chatRooms/{roomId}/messages` onCreate**: send FCM to the other participant.
- **Scheduled**: aggregate `reviews` by `revieweeId`, compute average, update `users/{uid}.trustScore`.
- **Premium listings**: scheduled check for expiry; set `isPremium: false` when period ends (if you add `premiumUntil` to listings).

---

## 8. Checklist summary

| Area              | Tasks |
|-------------------|--------|
| **Project & app** | Create project, add Web app, `.env` config |
| **Auth**          | Enable Email/Password (+ Phone), plan custom claims for role & verified |
| **Firestore**    | Create DB, add collections above, deploy security rules, add indexes |
| **Storage**       | Create bucket, folder structure, deploy storage rules |
| **FCM**           | Enable Cloud Messaging, VAPID key, save token in `users`, send via Functions or backend |
| **Functions**     | (Optional) Auth triggers, message notification, trustScore, premium expiry |

Use this spec as the single source of truth when building out Firebase for OneStack.
