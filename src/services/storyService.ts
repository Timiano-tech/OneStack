import { supabase } from '../lib/supabase';
import type { Story } from '../types';

export async function getCampusStories(campusId: string, userId: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      author:users (
        full_name,
        avatar_url
      ),
      story_views!left (
        viewer_id
      )
    `)
    .eq('campus_id', campusId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((s) => ({
    id: s.id,
    userId: s.user_id,
    mediaUrl: s.media_url,
    mediaType: s.media_type,
    caption: s.caption,
    campusId: s.campus_id,
    expiresAt: s.expires_at,
    viewCount: s.view_count || 0,
    backgroundColor: s.background_color || '#000000',
    stickerData: s.sticker_data || [],
    createdAt: s.created_at,
    author: s.author
      ? { fullName: s.author.full_name, avatarUrl: s.author.avatar_url }
      : undefined,
    hasViewed: (s.story_views || []).some((v: any) => v.viewer_id === userId),
  }));
}

export async function createStory(params: {
  userId: string;
  campusId: string;
  file: File;
  caption?: string;
}): Promise<string> {
  const { userId, campusId, file, caption } = params;
  const ext = file.name.split('.').pop();
  const fileName = `stories/${userId}/${Date.now()}.${ext}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(uploadData.path);

  const mediaType = file.type.startsWith('video') ? 'video' : 'image';

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: userId,
      campus_id: campusId,
      media_url: publicUrl,
      media_type: mediaType,
      caption,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

export async function viewStory(storyId: string, viewerId: string): Promise<void> {
  // Upsert to avoid duplicate
  await supabase
    .from('story_views')
    .upsert({ story_id: storyId, viewer_id: viewerId }, { onConflict: 'story_id,viewer_id' });

  // Increment view count
  try {
    const { error } = await supabase.rpc('increment_story_views', { story_id: storyId });
    if (error) throw error;
  } catch (err) {
    // Fallback if RPC doesn't exist
    const { data } = await supabase.from('stories').select('view_count').eq('id', storyId).single();
    if (data) {
      await supabase.from('stories').update({ view_count: (data.view_count || 0) + 1 }).eq('id', storyId);
    }
  }
}

export async function deleteStory(storyId: string): Promise<void> {
  await supabase.from('stories').delete().eq('id', storyId);
}

export async function getUserStories(userId: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((s) => ({
    id: s.id,
    userId: s.user_id,
    mediaUrl: s.media_url,
    mediaType: s.media_type,
    caption: s.caption,
    campusId: s.campus_id,
    expiresAt: s.expires_at,
    viewCount: s.view_count || 0,
    backgroundColor: s.background_color || '#000000',
    stickerData: s.sticker_data || [],
    createdAt: s.created_at,
  }));
}
