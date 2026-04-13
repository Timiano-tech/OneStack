import { supabase } from '../lib/supabase';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User } from '../types';

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const bucket = 'photos';
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true
  });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};

export const syncUserToSupabase = async (authUser: AuthUser, additionalData?: Partial<User>): Promise<User> => {
  const { data: userSnap, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (!userSnap) {
    const newUser: Partial<User> = {
      id: authUser.id,
      email: authUser.email || '',
      fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.display_name || 'User',
      username: authUser.user_metadata?.username || (authUser.email ? authUser.email.split('@')[0] : 'user_' + Math.random().toString(36).slice(2, 7)),
      avatarUrl: authUser.user_metadata?.avatar_url || '',
      coverUrl: authUser.user_metadata?.cover_url || '',
      campusId: '',
      isVerified: false,
      subscriptionTier: 'free',
      trustScore: 5.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...additionalData,
    };

    const dbUser = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.fullName,
      username: newUser.username,
      avatar_url: newUser.avatarUrl,
      cover_url: newUser.coverUrl,
      subscription_tier: newUser.subscriptionTier || 'free',
      campus_id: newUser.campusId || null,
      is_verified: newUser.isVerified,
      trust_score: newUser.trustScore,
      created_at: newUser.createdAt,
      updated_at: newUser.updatedAt,
    };

    const { error: insertError } = await supabase
      .from('users')
      .insert(dbUser);

    if (insertError) throw insertError;
    return newUser as User;
  }
  
  if (additionalData) {
    const dbUpdate: any = {};
    if (additionalData.fullName) dbUpdate.full_name = additionalData.fullName;
    if (additionalData.username) dbUpdate.username = additionalData.username;
    if (additionalData.avatarUrl) dbUpdate.avatar_url = additionalData.avatarUrl;
    if (additionalData.coverUrl) dbUpdate.cover_url = additionalData.coverUrl;
    if (additionalData.campusId) dbUpdate.campus_id = additionalData.campusId;
    if (additionalData.isVerified !== undefined) dbUpdate.is_verified = additionalData.isVerified;
    if (additionalData.trustScore !== undefined) dbUpdate.trust_score = additionalData.trustScore;
    if (additionalData.bio) dbUpdate.bio = additionalData.bio;
    if (additionalData.major) dbUpdate.major = additionalData.major;
    if (additionalData.graduationYear) dbUpdate.graduation_year = additionalData.graduationYear;

    const { error: updateError } = await supabase
      .from('users')
      .update(dbUpdate)
      .eq('id', authUser.id);

    if (updateError) throw updateError;
    
    return {
      id: userSnap.id,
      email: userSnap.email,
      fullName: userSnap.full_name,
      username: userSnap.username,
      avatarUrl: userSnap.avatar_url,
      coverUrl: userSnap.cover_url,
      subscriptionTier: userSnap.subscription_tier,
      campusId: userSnap.campus_id,
      isVerified: userSnap.is_verified,
      trustScore: Number(userSnap.trust_score),
      bio: userSnap.bio,
      major: userSnap.major,
      graduationYear: userSnap.graduation_year,
      createdAt: userSnap.created_at,
      updatedAt: userSnap.updated_at,
      ...additionalData
    } as User;
  }

  return {
    id: userSnap.id,
    email: userSnap.email,
    fullName: userSnap.full_name,
    username: userSnap.username,
    avatarUrl: userSnap.avatar_url,
    campusId: userSnap.campus_id,
    isVerified: userSnap.is_verified,
    trustScore: Number(userSnap.trust_score),
    bio: userSnap.bio,
    major: userSnap.major,
    graduationYear: userSnap.graduation_year,
    createdAt: userSnap.created_at,
    updatedAt: userSnap.updated_at,
  } as User;
};

export const updateUserProfileImage = async (authUser: AuthUser, file: File): Promise<string> => {
  const path = `profiles/${authUser.id}/${Date.now()}_${file.name}`;
  const avatarUrl = await uploadImage(file, path);
  
  await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl }
  });
  
  const { error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', authUser.id);

  if (error) throw error;
  
  return avatarUrl;
};
