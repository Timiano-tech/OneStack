import { supabase } from '../lib/supabase';
import type { Review } from '../types';

export async function addReview(params: {
  reviewerId: string;
  revieweeId: string;
  listingId?: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      reviewer_id: params.reviewerId,
      reviewee_id: params.revieweeId,
      listing_id: params.listingId,
      rating: params.rating,
      comment: params.comment,
    })
    .select()
    .single();

  if (error) throw error;

  // Recalculate trust score
  await calculateTrustScore(params.revieweeId);

  return {
    id: data.id,
    reviewerId: data.reviewer_id,
    revieweeId: data.reviewee_id,
    listingId: data.listing_id,
    rating: data.rating,
    comment: data.comment,
    aspects: data.aspects,
    isAnonymous: data.is_anonymous,
    createdAt: data.created_at,
  };
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:users!reviews_reviewer_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((r) => ({
    id: r.id,
    reviewerId: r.reviewer_id,
    revieweeId: r.reviewee_id,
    listingId: r.listing_id,
    rating: r.rating,
    comment: r.comment,
    aspects: r.aspects,
    isAnonymous: r.is_anonymous,
    createdAt: r.created_at,
    reviewer: r.reviewer
      ? { fullName: r.reviewer.full_name, avatarUrl: r.reviewer.avatar_url }
      : undefined,
  }));
}

export async function calculateTrustScore(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', userId);

  if (error || !data || data.length === 0) return 0;

  const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
  const score = Math.round(avg * 10) / 10; // 1 decimal

  await supabase
    .from('users')
    .update({ trust_score: score })
    .eq('id', userId);

  return score;
}

export async function getAverageRating(userId: string): Promise<{ avg: number; count: number }> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', userId);

  if (error || !data) return { avg: 0, count: 0 };

  const count = data.length;
  const avg = count > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  return { avg: Math.round(avg * 10) / 10, count };
}
