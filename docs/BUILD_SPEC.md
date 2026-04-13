-- ============================================================================
-- ONESTACK COMPLETE DATABASE MIGRATION
-- Comprehensive schema for campus marketplace application
-- ============================================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- For text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- For encryption functions

-- ============================================================================
-- BASE TABLES (Required for foreign key references)
-- ============================================================================

-- ─── CAMPUSES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    city TEXT,
    state TEXT,
    country TEXT NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active campuses" ON public.campuses
    FOR SELECT USING (is_active = TRUE);

-- ─── USERS (Extended Profile) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    cover_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business')),
    bio TEXT,
    campus_id UUID REFERENCES public.campuses(id) ON DELETE SET NULL,
    major TEXT,
    graduation_year INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_type TEXT CHECK (verification_type IN ('email', 'student_id', 'admin')),
    trust_score DECIMAL(3,2) DEFAULT 5.00,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    banned_until TIMESTAMPTZ,
    notification_preferences JSONB DEFAULT '{
        "push": true,
        "email": true,
        "likes": true,
        "comments": true,
        "follows": true,
        "messages": true,
        "marketplace": true
    }'::jsonb,
    privacy_settings JSONB DEFAULT '{
        "profile_visibility": "public",
        "show_online_status": true,
        "allow_messages_from": "everyone"
    }'::jsonb,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (
        (privacy_settings->>'profile_visibility')::text = 'public' 
        OR auth.uid() = id
    );

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Index for user search
CREATE INDEX IF NOT EXISTS idx_users_username_trgm ON public.users USING gin (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_full_name_trgm ON public.users USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_campus_id ON public.users(campus_id);

-- ============================================================================
-- POSTS & FEED CONTENT
-- ============================================================================

-- ─── POSTS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    campus_id UUID NOT NULL REFERENCES public.campuses(id),
    content TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    category TEXT NOT NULL CHECK (category IN (
        'Marketplace', 'Services', 'Deals', 'Jobs', 
        'Announcements', 'General', 'Question', 'Event'
    )),
    hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
    visibility TEXT DEFAULT 'campus' CHECK (visibility IN ('campus', 'all_campuses', 'followers')),
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    trending_score DECIMAL(10,2) DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    hidden_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Posts
CREATE POLICY "Anyone can view campus posts" ON public.posts
    FOR SELECT USING (
        is_hidden = FALSE 
        AND (
            visibility = 'all_campuses' 
            OR (visibility = 'campus' AND campus_id IN (
                SELECT campus_id FROM public.users WHERE id = auth.uid()
            ))
            OR (visibility = 'followers' AND (
                user_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM public.follows 
                    WHERE follower_id = auth.uid() AND following_id = user_id
                )
            ))
        )
    );

CREATE POLICY "Verified users can create posts" ON public.posts
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND is_verified = TRUE AND is_banned = FALSE
        )
    );

CREATE POLICY "Users can update their own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for Posts
CREATE INDEX IF NOT EXISTS idx_posts_campus_created ON public.posts(campus_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_trending_score ON public.posts(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON public.posts USING gin(hashtags);
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON public.posts USING gin(to_tsvector('english', content));

-- ============================================================================
-- LISTINGS (Marketplace)
-- ============================================================================

-- ─── LISTINGS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    campus_id UUID NOT NULL REFERENCES public.campuses(id),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    category TEXT NOT NULL CHECK (category IN (
        'Textbooks', 'Electronics', 'Furniture', 'Clothing', 
        'Housing', 'Tickets', 'Services', 'Free', 'Other'
    )),
    condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'reserved', 'expired', 'deleted')),
    is_negotiable BOOLEAN DEFAULT TRUE,
    meetup_location TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    view_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings" ON public.listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Verified users can create listings" ON public.listings
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND is_verified = TRUE AND is_banned = FALSE
        )
    );

CREATE POLICY "Users can update their own listings" ON public.listings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON public.listings
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for Listings
CREATE INDEX IF NOT EXISTS idx_listings_campus_status ON public.listings(campus_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_search ON public.listings USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================================================
-- ENGAGEMENT TABLES
-- ============================================================================

-- ─── COMMENTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT comment_target_check CHECK (
        (post_id IS NOT NULL AND listing_id IS NULL) OR 
        (post_id IS NULL AND listing_id IS NOT NULL)
    )
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (is_hidden = FALSE);

CREATE POLICY "Users can create comments" ON public.comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_banned = TRUE)
    );

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- Post owner can delete comments on their posts
CREATE POLICY "Post owners can delete comments on their posts" ON public.comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE id = comments.post_id AND user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_listing_id ON public.comments(listing_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_comment_id);

-- ─── LIKES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, post_id, comment_id),
    CONSTRAINT like_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);

CREATE POLICY "Users can like content" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike content" ON public.likes
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_comment_id ON public.likes(comment_id);

-- ─── SHARES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform TEXT CHECK (platform IN ('internal', 'whatsapp', 'telegram', 'email', 'copy_link')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT share_target_check CHECK (
        (post_id IS NOT NULL AND listing_id IS NULL) OR 
        (post_id IS NULL AND listing_id IS NOT NULL)
    )
);

ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shares" ON public.shares FOR SELECT USING (true);
CREATE POLICY "Users can share content" ON public.shares FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── SAVES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    collection TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, post_id, listing_id),
    CONSTRAINT save_target_check CHECK (
        (post_id IS NOT NULL AND listing_id IS NULL) OR 
        (post_id IS NULL AND listing_id IS NOT NULL)
    )
);

ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saves" ON public.saves
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save content" ON public.saves
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- SOCIAL FEATURES
-- ============================================================================

-- ─── FOLLOWS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see follows" ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON public.follows
    FOR DELETE USING (auth.uid() = follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- ─── BLOCKS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id <> blocked_id)
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their blocks" ON public.blocks
    FOR ALL USING (auth.uid() = blocker_id);

-- ============================================================================
-- STORIES
-- ============================================================================

-- ─── STORIES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    thumbnail_url TEXT,
    caption TEXT,
    campus_id UUID NOT NULL REFERENCES public.campuses(id),
    background_color TEXT DEFAULT '#000000',
    text_overlay TEXT,
    sticker_data JSONB DEFAULT '[]'::jsonb,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    view_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campus stories" ON public.stories
    FOR SELECT USING (
        expires_at > NOW() 
        AND EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.campus_id = stories.campus_id
        )
        AND NOT EXISTS (
            SELECT 1 FROM public.blocks 
            WHERE blocker_id = stories.user_id AND blocked_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own stories" ON public.stories
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_verified = TRUE)
    );

CREATE POLICY "Users can delete their own stories" ON public.stories
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_stories_campus_expires ON public.stories(campus_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id, created_at DESC);

-- ─── STORY VIEWS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.story_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(story_id, viewer_id)
);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see views for their own stories" ON public.story_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stories s 
            WHERE s.id = story_views.story_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can log their views" ON public.story_views
    FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- ============================================================================
-- MESSAGING SYSTEM
-- ============================================================================

-- ─── CONVERSATIONS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    title TEXT,
    icon_url TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- ─── CONVERSATION PARTICIPANTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    is_muted BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    
    UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations" ON public.conversation_participants
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their participation" ON public.conversation_participants
    FOR ALL USING (user_id = auth.uid());

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    content TEXT,
    media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    media_type TEXT CHECK (media_type IN ('image', 'video', 'file', 'audio', 'location')),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_for TEXT[] DEFAULT ARRAY[]::TEXT[],
    reactions JSONB DEFAULT '{}'::jsonb,
    read_by UUID[] DEFAULT ARRAY[]::UUID[],
    delivered_to UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid()
            AND left_at IS NULL
        )
        AND NOT (auth.uid() = ANY(deleted_for))
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid()
            AND left_at IS NULL
        )
    );

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- ─── TYPING INDICATORS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.typing_indicators (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone in conversation can see typing" ON public.typing_indicators 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = typing_indicators.conversation_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their typing status" ON public.typing_indicators 
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    deep_link TEXT,
    read_at TIMESTAMPTZ,
    is_seen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_notif_type CHECK (type IN (
        'like', 'comment', 'reply', 'mention', 'follow', 'follow_request',
        'message', 'listing_sold', 'price_drop', 'listing_inquiry',
        'story_view', 'story_reaction', 'welcome', 'announcement',
        'verification_approved', 'verification_rejected'
    )),
    CONSTRAINT valid_entity_type CHECK (entity_type IN (
        'post', 'listing', 'comment', 'story', 'user', 'conversation', 'review'
    ))
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications as read" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================================================
-- REPORTS & MODERATION
-- ============================================================================

-- ─── REPORTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'listing', 'message', 'user', 'story')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN (
        'spam', 'harassment', 'inappropriate_content', 'hate_speech',
        'violence', 'misinformation', 'scam', 'copyright', 'other'
    )),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    resolution_note TEXT,
    action_taken TEXT CHECK (action_taken IN ('none', 'warning', 'content_removed', 'user_suspended', 'user_banned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(reporter_id, target_type, target_id)
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_type, target_id);

-- ============================================================================
-- REVIEWS & TRUST SYSTEM
-- ============================================================================

-- ─── REVIEWS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    aspects JSONB DEFAULT '{}'::jsonb, -- e.g., {"communication": 5, "accuracy": 4, "shipping": 5}
    is_anonymous BOOLEAN DEFAULT FALSE,
    reviewee_response TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(reviewer_id, reviewee_id, listing_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see reviews" ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Users can leave reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON public.reviews(listing_id);

-- ============================================================================
-- SAVED SEARCHES
-- ============================================================================

-- ─── SAVED SEARCHES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'listing' CHECK (type IN ('post', 'listing', 'user')),
    filters JSONB NOT NULL DEFAULT '{}'::jsonb,
    sort_by TEXT,
    notify BOOLEAN DEFAULT TRUE,
    notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('instant', 'daily', 'weekly')),
    last_notified_at TIMESTAMPTZ,
    result_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their saved searches" ON public.saved_searches
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches(user_id);

-- ============================================================================
-- SUBSCRIPTIONS & PAYMENTS
-- ============================================================================

-- ─── SUBSCRIPTION PLANS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tier TEXT NOT NULL UNIQUE CHECK (tier IN ('free', 'pro', 'business')),
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    features JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
    FOR SELECT USING (is_active = TRUE);

-- ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_tier TEXT NOT NULL DEFAULT 'free' REFERENCES public.subscription_plans(tier),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'expired')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    payment_method JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- ANALYTICS & TRACKING
-- ============================================================================

-- ─── ANALYTICS EVENTS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    properties JSONB DEFAULT '{}'::jsonb,
    session_id UUID,
    device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.analytics_events
    FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_date ON public.analytics_events(event_type, created_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- ─── UPDATE UPDATED_AT COLUMN ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I;
            CREATE TRIGGER update_%s_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END $$;

-- ─── INCREMENT POST LIKE COUNT ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_post_like()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_like
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW
    WHEN (NEW.post_id IS NOT NULL OR OLD.post_id IS NOT NULL)
    EXECUTE FUNCTION public.handle_post_like();

-- ─── INCREMENT POST COMMENT COUNT ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_post_comment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL THEN
        UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL THEN
        UPDATE public.posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_comment
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment();

-- ─── UPDATE USER TRUST SCORE ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_user_trust_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET trust_score = (
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 5.00)
        FROM public.reviews
        WHERE reviewee_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id)
    )
    WHERE id = COALESCE(NEW.reviewee_id, OLD.reviewee_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_added
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_user_trust_score();

-- ─── CREATE NOTIFICATION ON COMMENT ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
    post_id_val UUID;
    actor_name TEXT;
BEGIN
    IF NEW.parent_comment_id IS NOT NULL THEN
        -- Reply to comment
        SELECT user_id INTO post_owner_id 
        FROM public.comments 
        WHERE id = NEW.parent_comment_id;
    ELSIF NEW.post_id IS NOT NULL THEN
        -- Comment on post
        SELECT user_id INTO post_owner_id 
        FROM public.posts 
        WHERE id = NEW.post_id;
        post_id_val := NEW.post_id;
    END IF;
    
    SELECT full_name INTO actor_name FROM public.users WHERE id = NEW.user_id;
    
    IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
        INSERT INTO public.notifications (
            user_id, actor_id, type, entity_type, entity_id, message, data
        ) VALUES (
            post_owner_id,
            NEW.user_id,
            CASE WHEN NEW.parent_comment_id IS NOT NULL THEN 'reply' ELSE 'comment' END,
            'post',
            COALESCE(post_id_val, NEW.post_id),
            actor_name || ' commented on your ' || 
            CASE WHEN NEW.parent_comment_id IS NOT NULL THEN 'comment' ELSE 'post' END,
            jsonb_build_object(
                'comment_id', NEW.id,
                'post_id', NEW.post_id,
                'comment_preview', LEFT(NEW.content, 100)
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_created
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- ─── CALCULATE TRENDING SCORE ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.calculate_trending_score(
    p_like_count INTEGER,
    p_comment_count INTEGER,
    p_share_count INTEGER,
    p_save_count INTEGER,
    p_created_at TIMESTAMPTZ
)
RETURNS DECIMAL AS $$
DECLARE
    hours_since_post DECIMAL;
    engagement_score DECIMAL;
    time_decay DECIMAL;
BEGIN
    hours_since_post := EXTRACT(EPOCH FROM (NOW() - p_created_at)) / 3600;
    
    -- Weighted engagement score
    engagement_score := (p_like_count * 1.0) + 
                        (p_comment_count * 2.0) + 
                        (p_share_count * 3.0) + 
                        (p_save_count * 2.5);
    
    -- Time decay factor (Gravity)
    time_decay := POWER(hours_since_post + 2, 1.5);
    
    RETURN ROUND((engagement_score / time_decay)::numeric, 2);
END;
$$ LANGUAGE plpgsql;

-- ─── UPDATE TRENDING SCORES PERIODICALLY ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_trending_scores()
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET trending_score = public.calculate_trending_score(
        like_count, comment_count, share_count, save_count, created_at
    )
    WHERE created_at > NOW() - INTERVAL '7 days'
    AND is_hidden = FALSE;
END;
$$ LANGUAGE plpgsql;

-- ─── CLEAN EXPIRED STORIES ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.clean_expired_stories()
RETURNS void AS $$
BEGIN
    UPDATE public.stories
    SET is_archived = TRUE
    WHERE expires_at < NOW() AND is_archived = FALSE;
END;
$$ LANGUAGE plpgsql;

-- ─── INCREMENT STORY VIEW COUNT ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_story_views(p_story_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.stories
    SET view_count = view_count + 1
    WHERE id = p_story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SCHEDULED JOBS (via pg_cron if available)
-- ============================================================================

-- Note: Requires pg_cron extension enabled in Supabase
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Update trending scores every 15 minutes
        PERFORM cron.schedule(
            'update-trending-scores',
            '*/15 * * * *',
            'SELECT public.update_trending_scores();'
        );
        
        -- Clean expired stories every hour
        PERFORM cron.schedule(
            'clean-expired-stories',
            '0 * * * *',
            'SELECT public.clean_expired_stories();'
        );
    END IF;
END $$;

-- ============================================================================
-- REALTIME PUBLICATIONS
-- ============================================================================

-- Drop existing publication if exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create new publication with all realtime tables
CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.posts,
    public.comments,
    public.likes,
    public.shares,
    public.notifications,
    public.stories,
    public.messages,
    public.conversation_participants,
    public.typing_indicators;

-- ============================================================================
-- INITIAL DATA SEEDING
-- ============================================================================

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, tier, price_monthly, price_yearly, features) VALUES
('Free', 'free', 0, 0, '{"max_listings": 5, "max_posts_per_day": 10, "analytics": false}'::jsonb),
('Pro', 'pro', 9.99, 99.99, '{"max_listings": 50, "max_posts_per_day": 50, "analytics": true, "boosted_posts": 5}'::jsonb),
('Business', 'business', 29.99, 299.99, '{"max_listings": -1, "max_posts_per_day": -1, "analytics": true, "boosted_posts": -1, "verified_badge": true}'::jsonb)
ON CONFLICT (tier) DO NOTHING;

-- Insert sample campuses
INSERT INTO public.campuses (name, code, city, state, country) VALUES
('University of Lagos', 'UNILAG', 'Lagos', 'Lagos', 'Nigeria'),
('University of Ibadan', 'UI', 'Ibadan', 'Oyo', 'Nigeria'),
('Ahmadu Bello University', 'ABU', 'Zaria', 'Kaduna', 'Nigeria'),
('University of Nigeria', 'UNN', 'Nsukka', 'Enugu', 'Nigeria'),
('Obafemi Awolowo University', 'OAU', 'Ile-Ife', 'Osun', 'Nigeria')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- COMPLETED
-- ============================================================================
-- Database schema for OneStack is now complete!
-- Run: supabase db push or execute in Supabase SQL Editor
-- ============================================================================
