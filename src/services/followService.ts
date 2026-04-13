import { supabase } from '../lib/supabase';
import type { Follow } from '../types';

export async function follow(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function unfollow(followerId: string, followingId: string): Promise<void> {
  await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  return !!data;
}

export async function getFollowerCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);
  return count ?? 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);
  return count ?? 0;
}

export async function getFollowers(userId: string): Promise<Follow[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('following_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((f) => ({
    id: f.id,
    followerId: f.follower_id,
    followingId: f.following_id,
    createdAt: f.created_at,
  }));
}

export async function getFollowing(userId: string): Promise<Follow[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((f) => ({
    id: f.id,
    followerId: f.follower_id,
    followingId: f.following_id,
    createdAt: f.created_at,
  }));
}
