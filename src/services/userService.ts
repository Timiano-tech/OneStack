import { supabase } from '../lib/supabase';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User } from '../types';

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const bucket = 'photos'; // Assume a 'photos' bucket exists
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

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows found"
    throw fetchError;
  }

  if (!userSnap) {
    const newUser: Partial<User> = {
      id: authUser.id,
      email: authUser.email || '',
      displayName: authUser.user_metadata?.display_name || 'User',
      photoURL: authUser.user_metadata?.avatar_url || '',
      universityId: '',
      campusId: '',
      isVerifiedStudent: false,
      trustScore: 0,
      createdAt: new Date().toISOString(),
      role: 'user',
      ...additionalData,
    };

    // Map to snake_case for DB
    const dbUser = {
      id: newUser.id,
      email: newUser.email,
      display_name: newUser.displayName,
      photo_url: newUser.photoURL,
      university_id: newUser.universityId,
      campus_id: newUser.campusId,
      is_verified_student: newUser.isVerifiedStudent,
      trust_score: newUser.trustScore,
      role: newUser.role,
      created_at: newUser.createdAt,
    };

    const { error: insertError } = await supabase
      .from('users')
      .insert(dbUser);

    if (insertError) throw insertError;
    return newUser as User;
  }
  
  if (additionalData) {
    // Map to snake_case
    const dbUpdate: any = {};
    if (additionalData.displayName) dbUpdate.display_name = additionalData.displayName;
    if (additionalData.photoURL) dbUpdate.photo_url = additionalData.photoURL;
    if (additionalData.universityId) dbUpdate.university_id = additionalData.universityId;
    if (additionalData.campusId) dbUpdate.campus_id = additionalData.campusId;
    if (additionalData.isVerifiedStudent !== undefined) dbUpdate.is_verified_student = additionalData.isVerifiedStudent;
    if (additionalData.trustScore !== undefined) dbUpdate.trust_score = additionalData.trustScore;

    const { error: updateError } = await supabase
      .from('users')
      .update(dbUpdate)
      .eq('id', authUser.id);

    if (updateError) throw updateError;
    
    // Return merged camelCase data
    return {
      id: userSnap.id,
      email: userSnap.email,
      displayName: userSnap.display_name,
      photoURL: userSnap.photo_url,
      universityId: userSnap.university_id,
      campusId: userSnap.campus_id,
      isVerifiedStudent: userSnap.is_verified_student,
      trustScore: userSnap.trust_score,
      createdAt: userSnap.created_at,
      role: userSnap.role,
      ...additionalData
    } as User;
  }

  // Return mapped camelCase data
  return {
    id: userSnap.id,
    email: userSnap.email,
    displayName: userSnap.display_name,
    photoURL: userSnap.photo_url,
    universityId: userSnap.university_id,
    campusId: userSnap.campus_id,
    isVerifiedStudent: userSnap.is_verified_student,
    trustScore: userSnap.trust_score,
    createdAt: userSnap.created_at,
    role: userSnap.role,
  } as User;
};

export const updateUserProfileImage = async (authUser: AuthUser, file: File): Promise<string> => {
  const path = `profiles/${authUser.id}/${Date.now()}_${file.name}`;
  const photoURL = await uploadImage(file, path);
  
  // Update Auth Metadata
  await supabase.auth.updateUser({
    data: { avatar_url: photoURL }
  });
  
  // Update Public Users table
  const { error } = await supabase
    .from('users')
    .update({ photo_url: photoURL })
    .eq('id', authUser.id);

  if (error) throw error;
  
  return photoURL;
};
