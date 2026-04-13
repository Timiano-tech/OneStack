// src/services/chatService.ts
import { supabase } from '../lib/supabase';
import type { Conversation, Message, Participant } from '../types';

const CONVERSATIONS_TABLE = 'conversations';
const PARTICIPANTS_TABLE = 'conversation_participants';
const MESSAGES_TABLE = 'messages';

export const getConversations = async (userId: string) => {
  // 1. Get all conversation IDs that the user is part of
  const { data: participation, error: pError } = await supabase
    .from(PARTICIPANTS_TABLE)
    .select(`
      conversation_id,
      last_read_at,
      is_muted,
      is_archived
    `)
    .eq('user_id', userId)
    .is('left_at', null);

  if (pError) throw pError;
  if (!participation || participation.length === 0) return [];

  const conversationIds = participation.map(p => p.conversation_id);

  // 2. Fetch conversation details and ALL participants for those conversations
  const { data: convos, error: cError } = await supabase
    .from(CONVERSATIONS_TABLE)
    .select(`
      *,
      participants:conversation_participants (
        user_id,
        role,
        last_read_at,
        user:users (
          full_name,
          avatar_url,
          is_verified
        )
      )
    `)
    .in('id', conversationIds)
    .order('updated_at', { ascending: false });

  if (cError) throw cError;

  return convos.map(convo => {
    // Find the other participant for direct chats
    const otherParticipantEntry = convo.participants.find((p: any) => p.user_id !== userId);
    
    return {
      id: convo.id,
      type: convo.type,
      title: convo.title,
      iconUrl: convo.icon_url,
      lastMessageAt: convo.last_message_at,
      createdAt: convo.created_at,
      updatedAt: convo.updated_at,
      participants: convo.participants.map((p: any) => ({
        userId: p.user_id,
        role: p.role,
        lastReadAt: p.last_read_at,
        user: {
          fullName: p.user.full_name,
          avatarUrl: p.user.avatar_url,
          isVerified: p.user.is_verified
        }
      })),
      otherParticipant: otherParticipantEntry ? {
        fullName: otherParticipantEntry.user.full_name,
        avatarUrl: otherParticipantEntry.user.avatar_url,
        isVerified: otherParticipantEntry.user.is_verified
      } : null
    } as Conversation;
  });
};

export const getMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data.map(m => ({
    id: m.id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    content: m.content,
    mediaUrls: m.media_urls || [],
    mediaType: m.media_type,
    reactions: m.reactions || {},
    readBy: m.read_by || [],
    createdAt: m.created_at,
    updatedAt: m.updated_at
  } as Message));
};

export const sendMessage = async (conversationId: string, senderId: string, content: string, mediaUrls: string[] = []) => {
  // 1. Insert message
  const { data: message, error: msgError } = await supabase
    .from(MESSAGES_TABLE)
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      media_urls: mediaUrls,
    })
    .select()
    .single();

  if (msgError) throw msgError;

  // 2. Update conversation updated_at and last_message_at
  // Usually handled by DB triggers in advanced setups, but let's do it manually if needed
  await supabase
    .from(CONVERSATIONS_TABLE)
    .update({
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  return {
    id: message.id,
    conversationId: message.conversation_id,
    senderId: message.sender_id,
    content: message.content,
    mediaUrls: message.media_urls || [],
    createdAt: message.created_at,
    updatedAt: message.updated_at
  } as Message;
};

export const markAsRead = async (conversationId: string, userId: string) => {
  // Update the participant's last_read_at
  const { error } = await supabase
    .from(PARTICIPANTS_TABLE)
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const getOrCreateConversation = async (myId: string, otherId: string) => {
  // 1. Find a direct conversation where BOTH users are participants
  // This requires a self-join query or a complex filter
  const { data: existing, error: findError } = await supabase
    .rpc('get_direct_conversation', { p_user1: myId, p_user2: otherId });

  // Note: Since I haven't defined the RPC in migrations, I'll use a standard query
  // for now but the RPC is safer. Let's do a subquery approach.
  
  const { data: myConvos } = await supabase
    .from(PARTICIPANTS_TABLE)
    .select('conversation_id')
    .eq('user_id', myId);

  const { data: otherConvos } = await supabase
    .from(PARTICIPANTS_TABLE)
    .select('conversation_id')
    .eq('user_id', otherId);

  if (myConvos && otherConvos) {
    const common = myConvos.filter(mc => otherConvos.some(oc => oc.conversation_id === mc.conversation_id));
    if (common.length > 0) {
      // Potentially multiple, but let's take the first "direct" one
      const { data: actualConvo } = await supabase
        .from(CONVERSATIONS_TABLE)
        .select('id, type')
        .in('id', common.map(c => c.conversation_id))
        .eq('type', 'direct')
        .maybeSingle();

      if (actualConvo) return actualConvo.id;
    }
  }

  // 2. Create new conversation if none found
  const { data: created, error } = await supabase
    .from(CONVERSATIONS_TABLE)
    .insert({
      type: 'direct',
      created_by: myId,
    })
    .select()
    .single();

  if (error) throw error;

  // 3. Add participants
  await supabase
    .from(PARTICIPANTS_TABLE)
    .insert([
      { conversation_id: created.id, user_id: myId, role: 'admin' },
      { conversation_id: created.id, user_id: otherId, role: 'member' },
    ]);

  return created.id;
};

export const subscribeToMessages = (conversationId: string, onMessage: (message: Message) => void) => {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: MESSAGES_TABLE,
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const m = payload.new;
        onMessage({
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          content: m.content,
          mediaUrls: m.media_urls || [],
          createdAt: m.created_at,
          updatedAt: m.updated_at
        } as Message);
      }
    )
    .subscribe();
};