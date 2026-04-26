import { supabase } from '../lib/supabase';
import type { Listing, ItemCategory, Condition } from '../types';

const LISTINGS_TABLE = 'listings';

export const uploadListingImages = async (userId: string, files: File[]): Promise<string[]> => {
  const urls: string[] = [];
  const bucket = 'photos';
  for (const file of files) {
    try {
      const fileName = `listings/${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
      urls.push(publicUrl);
    } catch (err) {
      console.error('Listing image upload failed', err);
    }
  }
  return urls;
};

export const createListing = async (listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'inquiryCount'>, imageFiles?: File[]) => {
  let imageUrls = listingData.images;
  if (imageFiles && imageFiles.length > 0) {
    const uploaded = await uploadListingImages(listingData.userId, imageFiles);
    imageUrls = [...imageUrls, ...uploaded];
  }

  const dbData = {
    user_id: listingData.userId,
    campus_id: listingData.campusId,
    title: listingData.title,
    description: listingData.description,
    price: listingData.price,
    currency: listingData.currency,
    category: listingData.category,
    type: listingData.type,
    condition: listingData.condition,
    images: imageUrls,
    status: listingData.status,
    is_premium: listingData.isPremium,
    is_negotiable: listingData.isNegotiable,
    meetup_location: listingData.meetupLocation,
    tags: listingData.tags,
    expires_at: listingData.expiresAt,
  };

  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .insert(dbData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getListings = async (filters?: {
  category?: string;
  campusId?: string;
  userId?: string;
  query?: string;
  status?: string;
}) => {
  let queryBuilder = supabase.from(LISTINGS_TABLE).select(`
    *,
    author:users (
      full_name,
      avatar_url,
      is_verified,
      trust_score
    )
  `);

  if (filters?.category && filters.category !== 'All') {
    queryBuilder = queryBuilder.eq('category', filters.category);
  }
  if (filters?.campusId) {
    queryBuilder = queryBuilder.eq('campus_id', filters.campusId);
  }
  if (filters?.userId) {
    queryBuilder = queryBuilder.eq('user_id', filters.userId);
  }
  if (filters?.query) {
    queryBuilder = queryBuilder.ilike('title', `%${filters.query}%`);
  }
  
  // Default to active unless specified
  queryBuilder = queryBuilder.eq('status', filters?.status || 'active');

  queryBuilder = queryBuilder.order('created_at', { ascending: false });

  const { data, error } = await queryBuilder;
  if (error) throw error;

  return data.map(l => ({
    id: l.id,
    userId: l.user_id,
    campusId: l.campus_id,
    title: l.title,
    description: l.description,
    price: Number(l.price),
    currency: l.currency,
    category: l.category as any,
    type: l.type as any,
    condition: l.condition as any,
    images: l.images,
    status: l.status as any,
    isPremium: l.is_premium,
    isNegotiable: l.is_negotiable,
    meetupLocation: l.meetup_location,
    tags: l.tags,
    viewCount: l.view_count,
    inquiryCount: l.inquiry_count,
    expiresAt: l.expires_at,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
    author: l.author ? {
      fullName: l.author.full_name,
      avatarUrl: l.author.avatar_url,
      isVerified: l.author.is_verified,
      trustScore: Number(l.author.trust_score)
    } : undefined
  } as Listing & { author: any }));
};

export const getListingById = async (id: string) => {
  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .select(`
      *,
      author:users (
        full_name,
        avatar_url,
        is_verified,
        trust_score
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    campusId: data.campus_id,
    title: data.title,
    description: data.description,
    price: Number(data.price),
    currency: data.currency,
    category: data.category as any,
    type: data.type as any,
    condition: data.condition as any,
    images: data.images,
    status: data.status as any,
    isPremium: data.is_premium,
    isNegotiable: data.is_negotiable,
    meetupLocation: data.meetup_location,
    tags: data.tags,
    viewCount: data.view_count,
    inquiryCount: data.inquiry_count,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    author: data.author ? {
      fullName: data.author.full_name,
      avatarUrl: data.author.avatar_url,
      isVerified: data.author.is_verified,
      trustScore: Number(data.author.trust_score)
    } : undefined
  } as Listing & { author: any };
};
