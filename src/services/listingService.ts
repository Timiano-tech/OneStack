import { supabase } from '../lib/supabase';
import type { Listing, ListingType, ItemCategory, ServiceCategory, Condition } from '../types';

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

export const createListing = async (listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>, imageFiles?: File[]) => {
  let imageUrls = listingData.images;
  if (imageFiles && imageFiles.length > 0) {
    const uploaded = await uploadListingImages(listingData.userId, imageFiles);
    imageUrls = [...imageUrls, ...uploaded];
  }

  const dbData = {
    user_id: listingData.userId,
    type: listingData.type,
    title: listingData.title,
    description: listingData.description,
    price: listingData.price,
    currency: listingData.currency,
    category: listingData.category,
    condition: listingData.condition,
    images: imageUrls,
    location: listingData.location,
    campus_id: listingData.campusId,
    university_id: listingData.universityId,
    is_premium: listingData.isPremium,
    status: listingData.status,
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
  type?: ListingType;
  campusId?: string;
  userId?: string;
  query?: string;
  isPremium?: boolean;
}) => {
  let queryBuilder = supabase.from(LISTINGS_TABLE).select(`
    *,
    author:users (
      display_name,
      photo_url,
      is_verified_student,
      trust_score
    )
  `);

  if (filters?.category && filters.category !== 'All') {
    queryBuilder = queryBuilder.eq('category', filters.category);
  }
  if (filters?.type) {
    queryBuilder = queryBuilder.eq('type', filters.type);
  }
  if (filters?.campusId) {
    queryBuilder = queryBuilder.eq('campus_id', filters.campusId);
  }
  if (filters?.userId) {
    queryBuilder = queryBuilder.eq('user_id', filters.userId);
  }
  if (filters?.isPremium !== undefined) {
    queryBuilder = queryBuilder.eq('is_premium', filters.isPremium);
  }
  if (filters?.query) {
    queryBuilder = queryBuilder.ilike('title', `%${filters.query}%`);
  }

  queryBuilder = queryBuilder.order('is_premium', { ascending: false }).order('created_at', { ascending: false });

  const { data, error } = await queryBuilder;
  if (error) throw error;

  return data.map(l => ({
    id: l.id,
    userId: l.user_id,
    type: l.type,
    title: l.title,
    description: l.description,
    price: Number(l.price),
    currency: l.currency,
    category: l.category as any,
    condition: l.condition as any,
    images: l.images,
    location: l.location,
    campusId: l.campus_id,
    universityId: l.university_id,
    isPremium: l.is_premium,
    status: l.status as any,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
    author: l.author ? {
      displayName: l.author.display_name,
      photoURL: l.author.photo_url,
      isVerifiedStudent: l.author.is_verified_student,
      trustScore: l.author.trust_score
    } : undefined
  } as Listing & { author: any }));
};

export const getListingById = async (id: string) => {
  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .select(`
      *,
      author:users (
        display_name,
        photo_url,
        is_verified_student,
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
    type: data.type,
    title: data.title,
    description: data.description,
    price: Number(data.price),
    currency: data.currency,
    category: data.category as any,
    condition: data.condition as any,
    images: data.images,
    location: data.location,
    campusId: data.campus_id,
    universityId: data.university_id,
    isPremium: data.is_premium,
    status: data.status as any,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    author: data.author ? {
      displayName: data.author.display_name,
      photoURL: data.author.photo_url,
      isVerifiedStudent: data.author.is_verified_student,
      trustScore: data.author.trust_score
    } : undefined
  } as Listing & { author: any };
};
