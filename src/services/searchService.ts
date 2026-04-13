import { supabase } from '../lib/supabase';
import type { SearchResults } from '../types';

export async function globalSearch(query: string): Promise<SearchResults> {
  if (!query.trim()) return { posts: [], listings: [], users: [] };

  const q = `%${query.toLowerCase()}%`;

  const [postsResult, listingsResult, usersResult] = await Promise.allSettled([
    supabase
      .from('posts')
      .select(`
        *,
        author:users (full_name, avatar_url, is_verified)
      `)
      .or(`content.ilike.${q}`)
      .order('trending_score', { ascending: false })
      .limit(10),

    supabase
      .from('listings')
      .select(`
        *,
        author:users (full_name, avatar_url, is_verified)
      `)
      .or(`title.ilike.${q},description.ilike.${q}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('users')
      .select('id, full_name, avatar_url, is_verified, trust_score, campus_id')
      .or(`full_name.ilike.${q}`)
      .limit(10),
  ]);

  const posts =
    postsResult.status === 'fulfilled' && postsResult.value.data
      ? postsResult.value.data.map((p: any) => ({
          id: p.id,
          userId: p.user_id,
          campusId: p.campus_id,
          universityId: p.university_id,
          content: p.content,
          images: p.images,
          category: p.category,
          hashtags: p.hashtags,
          visibility: p.visibility,
          likeCount: p.like_count,
          commentCount: p.comment_count,
          shareCount: p.share_count,
          saveCount: p.save_count,
          trendingScore: p.trending_score,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          author: p.author
            ? { fullName: p.author.full_name, avatarUrl: p.author.avatar_url, isVerified: p.author.is_verified }
            : undefined,
        }))
      : [];

  const listings =
    listingsResult.status === 'fulfilled' && listingsResult.value.data
      ? listingsResult.value.data.map((l: any) => ({
          id: l.id,
          userId: l.user_id,
          type: l.type,
          title: l.title,
          description: l.description,
          price: l.price,
          currency: l.currency,
          category: l.category,
          condition: l.condition,
          images: l.images || [],
          location: l.location,
          campusId: l.campus_id,
          universityId: l.university_id,
          isPremium: l.is_premium,
          status: l.status,
          createdAt: l.created_at,
          updatedAt: l.updated_at,
          author: l.author
            ? { fullName: l.author.full_name, avatarUrl: l.author.avatar_url }
            : undefined,
        }))
      : [];

  const users =
    usersResult.status === 'fulfilled' && usersResult.value.data
      ? usersResult.value.data.map((u: any) => ({
          id: u.id,
          fullName: u.full_name,
          avatarUrl: u.avatar_url,
          isVerified: u.is_verified,
          trustScore: u.trust_score,
          campusId: u.campus_id,
          createdAt: '',
        }))
      : [];

  return { posts, listings, users };
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
