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
  content,
  imageFiles,
  category,
  hashtags,
  visibility,
}: {
  userId: string;
  campusId: string;
  content: string;
  imageFiles: File[];
  category: PostCategory;
  hashtags: string[];
  visibility: 'campus' | 'all_campuses' | 'followers';
}) {
  const imageUrls = imageFiles.length > 0 ? await uploadPostImages(userId, imageFiles) : [];

  const postData = {
    user_id: userId,
    campus_id: campusId,
    content,
    images: imageUrls,
    category,
    hashtags,
    visibility,
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
        full_name,
        avatar_url,
        is_verified
      )
    `)
    .eq('is_hidden', false);

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
    content: post.content,
    images: post.images,
    category: post.category,
    hashtags: post.hashtags,
    visibility: post.visibility,
    likeCount: post.like_count,
    commentCount: post.comment_count,
    shareCount: post.share_count,
    saveCount: post.save_count,
    trendingScore: Number(post.trending_score),
    isEdited: post.is_edited,
    editedAt: post.edited_at,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    author: post.author ? {
      fullName: post.author.full_name,
      avatarUrl: post.author.avatar_url,
      isVerified: post.author.is_verified
    } : undefined
  } as Post));

  return {
    posts,
    nextPage: posts.length === POSTS_PER_PAGE ? lastPage + 1 : null,
  };
}

export async function getPostById(postId: string): Promise<Post | null> {
  const { data: post, error } = await supabase
    .from(POSTS_TABLE)
    .select(`
      *,
      author:users (
        full_name,
        avatar_url,
        is_verified
      )
    `)
    .eq('id', postId)
    .single();

  if (error || !post) return null;

  return {
    id: post.id,
    userId: post.user_id,
    campusId: post.campus_id,
    content: post.content,
    images: post.images,
    category: post.category,
    hashtags: post.hashtags,
    visibility: post.visibility,
    likeCount: post.like_count,
    commentCount: post.comment_count,
    shareCount: post.share_count,
    saveCount: post.save_count,
    trendingScore: Number(post.trending_score),
    isEdited: post.is_edited,
    editedAt: post.edited_at,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    author: post.author ? {
      fullName: post.author.full_name,
      avatarUrl: post.author.avatar_url,
      isVerified: post.author.is_verified
    } : undefined
  } as Post;
}

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  const { data: existingLike } = await supabase
    .from(LIKES_TABLE)
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingLike) {
    // Add like - DB trigger handle_post_like handles counts
    await supabase.from(LIKES_TABLE).insert({ post_id: postId, user_id: userId });
    return true;
  } else {
    // Remove like - DB trigger handle_post_like handles counts
    await supabase.from(LIKES_TABLE).delete().eq('post_id', postId).eq('user_id', userId);
    return false;
  }
}

export async function checkHasLiked(postId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from(LIKES_TABLE)
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();
  
  return !!data;
}

export async function toggleSavePost(postId: string, userId: string): Promise<boolean> {
  const { data: existingSave } = await supabase
    .from(SAVES_TABLE)
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingSave) {
    await supabase.from(SAVES_TABLE).insert({ post_id: postId, user_id: userId });
    return true;
  } else {
    await supabase.from(SAVES_TABLE).delete().eq('post_id', postId).eq('user_id', userId);
    return false;
  }
}

export async function checkHasSaved(postId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from(SAVES_TABLE)
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();
  
  return !!data;
}

export async function addComment(postId: string, userId: string, content: string, parentCommentId?: string) {
  const commentData = {
    post_id: postId,
    user_id: userId,
    parent_comment_id: parentCommentId || null,
    content,
  };

  const { data: comment, error } = await supabase
    .from(COMMENTS_TABLE)
    .insert(commentData)
    .select()
    .single();

  if (error) throw error;
  // DB trigger on_post_comment handles counts
  return comment.id;
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from(COMMENTS_TABLE)
    .select(`
      *,
      author:users (
        full_name,
        avatar_url,
        is_verified
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
    replyCount: comment.reply_count,
    isEdited: comment.is_edited,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    author: comment.author ? {
      fullName: comment.author.full_name,
      avatarUrl: comment.author.avatar_url,
      isVerified: comment.author.is_verified
    } : undefined
  } as Comment));
}

export async function deletePost(postId: string, _userId: string) {
  const { error } = await supabase
    .from(POSTS_TABLE)
    .delete()
    .eq('id', postId);
  
  if (error) throw error;
}

export async function deleteComment(commentId: string, _postId: string) {
  await supabase.from(COMMENTS_TABLE).delete().eq('id', commentId);
}

export async function reportContent(reporterId: string, targetId: string, targetType: 'post' | 'comment' | 'listing' | 'user' | 'story', reason: string, description: string = '') {
  const { error } = await supabase
    .from(REPORTS_TABLE)
    .insert({
      reporter_id: reporterId,
      target_id: targetId,
      target_type: targetType,
      reason,
      description,
      status: 'pending',
    });
    
  if (error) throw error;
}
