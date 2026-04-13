import { supabase } from '../lib/supabase';
import type { Notification } from '../types';

export async function getNotifications(userId: string, limit = 30): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:users (
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((n) => ({
    id: n.id,
    userId: n.user_id,
    actorId: n.actor_id,
    type: n.type as any,
    entityType: n.entity_type as any,
    entityId: n.entity_id,
    message: n.message,
    data: n.data,
    readAt: n.read_at,
    isSeen: n.is_seen,
    createdAt: n.created_at,
    actor: n.actor
      ? { fullName: n.actor.full_name, avatarUrl: n.actor.avatar_url }
      : undefined,
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) return 0;
  return count ?? 0;
}

export async function markAsRead(notificationId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);
}

export async function markAllRead(userId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await supabase.from('notifications').delete().eq('id', notificationId);
}

export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const n = payload.new as any;
        callback({
          id: n.id,
          userId: n.user_id,
          actorId: n.actor_id,
          type: n.type,
          entityType: n.entity_type,
          entityId: n.entity_id,
          message: n.message,
          data: n.data,
          readAt: n.read_at,
          isSeen: n.is_seen,
          createdAt: n.created_at,
        } as Notification);
      }
    )
    .subscribe();
}

export async function createNotification(params: {
  userId: string;
  actorId?: string;
  type: Notification['type'];
  entityType: Notification['entityType'];
  entityId?: string;
  message: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  await supabase.from('notifications').insert({
    user_id: params.userId,
    actor_id: params.actorId,
    type: params.type,
    entity_type: params.entityType,
    entity_id: params.entityId,
    message: params.message,
    data: params.data || {},
  });
}
