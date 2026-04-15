-- 1. Compound Indexes for UI performance

-- Feed queries: filter by campus_id, sort by created_at DESC
CREATE INDEX IF NOT EXISTS idx_posts_campus_created_at
  ON public.posts (campus_id, created_at DESC);

-- Comments queries: sort by created_at ASC (usually fetched by post_id)
CREATE INDEX IF NOT EXISTS idx_comments_post_created_at
  ON public.comments (post_id, created_at ASC);

-- Messages queries: fetched by conversation_id, sorted by created_at DESC
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at
  ON public.messages (conversation_id, created_at DESC);

-- 2. handle_new_user trigger synchronization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url, campus_id)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'campus_id'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url,
    campus_id = EXCLUDED.campus_id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Trending algorithm View or Function
-- Engagement velocity: (likes=2, comments=5, shares=3, saves=4)
-- Time decay: items older than 7 days decay.
CREATE OR REPLACE FUNCTION calculate_trending_score(post_id uuid)
RETURNS float AS $$
DECLARE
  score float;
  p_likes_count int;
  p_comments_count int;
  p_shares_count int;
  p_saves_count int;
  post_age_days float;
BEGIN
  -- Assume these columns exist in posts or we compute them on the fly. 
  -- For a high perf feed, they should be counter-cached.
  SELECT 
    COALESCE(likes_count, 0),
    COALESCE(comments_count, 0),
    COALESCE(shares_count, 0),
    COALESCE(saves_count, 0),
    EXTRACT(EPOCH FROM (now() - created_at))/86400.0
  INTO 
    p_likes_count, p_comments_count, p_shares_count, p_saves_count, post_age_days
  FROM public.posts WHERE id = post_id;

  -- 7 days window drop-off constraint
  IF post_age_days > 7 THEN
    RETURN 0;
  END IF;

  score := (p_likes_count * 2) + (p_comments_count * 5) + (p_shares_count * 3) + (p_saves_count * 4);
  
  -- Time decay inversely proportional to age (e.g. score / (age_in_hours + 2)^1.5)
  score := score / POWER((post_age_days * 24) + 2, 1.5);
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Expire Stories
CREATE OR REPLACE FUNCTION archive_expired_stories()
RETURNS void AS $$
BEGIN
  UPDATE public.story_reels
  SET expires_at = now(), status = 'archived'
  WHERE created_at < now() - interval '24 hours' AND status != 'archived';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
