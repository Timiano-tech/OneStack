import { supabase } from '../lib/supabase';
import type { Post, Comment, PostCategory } from '../types';

const POSTS_TABLE = 'posts';
const COMMENTS_TABLE = 'comments';
const LIKES_TABLE = 'likes';
const SAVES_TABLE = 'saves';
const REPORTS_TABLE = 'reports';

const POSTS_PER_PAGE = 10;

/** Use canvas to compress image before upload */
export async function compressImage(file: File, maxWidth = 1080): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Failed to get canvas context');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject('Canvas to Blob failed');
        },
        'image/jpeg',
        0.8
      );
    };
    img.onerror = (e) => reject(e);
  });
}

export async function uploadPostImages(userId: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  const bucket = 'photos';
  for (const file of files) {
    try {
      const compressedBlob = await compressImage(file);
      const fileName = `posts/${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, compressedBlob);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
      urls.push(publicUrl);
    } catch (err) {
      console.error('Image upload failed', err);
    }
  }
  return urls;
}

export async function createPost({
  userId,
  campusId,
  universityId,
  content,
  imageFiles,
  category,
  hashtags,
  visibility,
}: {
  userId: string;
  campusId: string;
  universityId: string;
  content: string;
  imageFiles: File[];
  category: PostCategory | 'General';
  hashtags: string[];
  visibility: 'campus' | 'university' | 'public';
}) {
  const imageUrls = imageFiles.length > 0 ? await uploadPostImages(userId, imageFiles) : [];

  const postData = {
    user_id: userId,
    campus_id: campusId,
    university_id: universityId,
    content,
    images: imageUrls,
    category,
    hashtags,
    visibility,
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    save_count: 0,
    trending_score: 0,
  };

  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .insert(postData)
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

export async function getFeedPosts({
  campusId,
  category,
  isTrending = false,
  lastPage = 0,
}: {
  campusId?: string;
  category?: string;
  isTrending?: boolean;
  lastPage?: number;
}) {
  let query = supabase
    .from(POSTS_TABLE)
    .select(`
      *,
      author:users (
        display_name,
        photo_url,
        is_verified_student
      )
    `);

  if (campusId) query = query.eq('campus_id', campusId);
  if (category && category !== 'All') query = query.eq('category', category);

  if (isTrending) {
    query = query.order('trending_score', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const from = lastPage * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) throw error;

  const posts = data.map(post => ({
    id: post.id,
    userId: post.user_id,
    campusId: post.campus_id,
    universityId: post.university_id,
    content: post.content,
    images: post.images,
    category: post.category,
    hashtags: post.hashtags,
    visibility: post.visibility,
    likeCount: post.like_count,
    commentCount: post.comment_count,
    shareCount: post.share_count,
    saveCount: post.save_count,
    trendingScore: post.trending_score,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    author: post.author ? {
      displayName: post.author.display_name,
      photoURL: post.author.photo_url,
      isVerifiedStudent: post.author.is_verified_student
    } : undefined
  } as any));

  return {
    posts,
    nextPage: posts.length === POSTS_PER_PAGE ? lastPage + 1 : null,
  };
}

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  const likeId = `${postId}_${userId}`;
  
  // Check if liked
  const { data: existingLike } = await supabase
    .from(LIKES_TABLE)
    .select('*')
    .eq('id', likeId)
    .single();

  if (!existingLike) {
    // Add like
    await supabase.from(LIKES_TABLE).insert({ id: likeId, post_id: postId, user_id: userId });
    // Update count (Note: Not atomic without RPC)
    const { data: post } = await supabase.from(POSTS_TABLE).select('like_count, trending_score').eq('id', postId).single();
    await supabase.from(POSTS_TABLE).update({ 
      like_count: (post?.like_count || 0) + 1,
      trending_score: (post?.trending_score || 0) + 2
    }).eq('id', postId);
    return true;
  } else {
    // Remove like
    await supabase.from(LIKES_TABLE).delete().eq('id', likeId);
    // Update count
    const { data: post } = await supabase.from(POSTS_TABLE).select('like_count, trending_score').eq('id', postId).single();
    await supabase.from(POSTS_TABLE).update({ 
      like_count: Math.max(0, (post?.like_count || 0) - 1),
      trending_score: (post?.trending_score || 0) - 2
    }).eq('id', postId);
    return false;
  }
}

export async function checkHasLiked(postId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(LIKES_TABLE)
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();
  
  return !!data;
}

export async function toggleSavePost(postId: string, userId: string): Promise<boolean> {
  const saveId = `${postId}_${userId}`;
  
  const { data: existingSave } = await supabase
    .from(SAVES_TABLE)
    .select('*')
    .eq('id', saveId)
    .single();

  if (!existingSave) {
    await supabase.from(SAVES_TABLE).insert({ id: saveId, post_id: postId, user_id: userId });
    const { data: post } = await supabase.from(POSTS_TABLE).select('save_count, trending_score').eq('id', postId).single();
    await supabase.from(POSTS_TABLE).update({ 
      save_count: (post?.save_count || 0) + 1,
      trending_score: (post?.trending_score || 0) + 5
    }).eq('id', postId);
    return true;
  } else {
    await supabase.from(SAVES_TABLE).delete().eq('id', saveId);
    const { data: post } = await supabase.from(POSTS_TABLE).select('save_count, trending_score').eq('id', postId).single();
    await supabase.from(POSTS_TABLE).update({ 
      save_count: Math.max(0, (post?.save_count || 0) - 1),
      trending_score: (post?.trending_score || 0) - 5
    }).eq('id', postId);
    return false;
  }
}

export async function checkHasSaved(postId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from(SAVES_TABLE)
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();
  
  return !!data;
}

export async function addComment(postId: string, userId: string, content: string, parentCommentId?: string) {
  const commentData = {
    post_id: postId,
    user_id: userId,
    parent_comment_id: parentCommentId || null,
    content,
    like_count: 0,
  };

  const { data: comment, error } = await supabase
    .from(COMMENTS_TABLE)
    .insert(commentData)
    .select()
    .single();

  if (error) throw error;

  // Update post comment count
  const { data: post } = await supabase.from(POSTS_TABLE).select('comment_count, trending_score').eq('id', postId).single();
  await supabase.from(POSTS_TABLE).update({
    comment_count: (post?.comment_count || 0) + 1,
    trending_score: (post?.trending_score || 0) + 3,
  }).eq('id', postId);

  return comment.id;
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from(COMMENTS_TABLE)
    .select(`
      *,
      author:users (
        display_name,
        photo_url,
        is_verified_student
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  return data.map(comment => ({
    id: comment.id,
    postId: comment.post_id,
    userId: comment.user_id,
    parentCommentId: comment.parent_comment_id,
    content: comment.content,
    likeCount: comment.like_count,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    author: comment.author ? {
      displayName: comment.author.display_name,
      photoURL: comment.author.photo_url,
      isVerifiedStudent: comment.author.is_verified_student
    } : undefined
  } as any));
}

export async function deletePost(postId: string, _userId: string) {
  const { error } = await supabase
    .from(POSTS_TABLE)
    .delete()
    .eq('id', postId);
  
  if (error) throw error;
}

export async function deleteComment(commentId: string, postId: string) {
  await supabase.from(COMMENTS_TABLE).delete().eq('id', commentId);
  
  const { data: post } = await supabase.from(POSTS_TABLE).select('comment_count, trending_score').eq('id', postId).single();
  await supabase.from(POSTS_TABLE).update({
    comment_count: Math.max(0, (post?.comment_count || 0) - 1),
    trending_score: (post?.trending_score || 0) - 3,
  }).eq('id', postId);
}

export async function reportContent(reporterId: string, targetId: string, type: 'post' | 'comment', reason: string, description: string = '') {
  const { error } = await supabase
    .from(REPORTS_TABLE)
    .insert({
      reporter_id: reporterId,
      target_id: targetId,
      type,
      reason,
      description,
      status: 'pending',
    });
    
  if (error) throw error;
}
