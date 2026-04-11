// src/services/chatService.ts
import { supabase } from '../lib/supabase';
import type { Conversation, Message } from '../types';

const CONVERSATIONS_TABLE = 'conversations';
const MESSAGES_TABLE = 'messages';

export const getConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from(CONVERSATIONS_TABLE)
    .select(`
      *,
      listing:listings (
        id,
        title,
        images
      )
    `)
    .contains('participants', [userId])
    .order('updated_at', { ascending: false });

  if (error) throw error;

  // Fetch profiles of other participants
  const conversationsWithProfiles = await Promise.all(
    data.map(async (convo) => {
      const otherId = convo.participants.find((id: string) => id !== userId);
      if (otherId) {
        const { data: profile } = await supabase
          .from('users')
          .select('display_name, photo_url, is_verified_student')
          .eq('id', otherId)
          .single();

        return {
          ...convo,
          otherParticipant: profile ? {
            displayName: profile.display_name,
            photoURL: profile.photo_url,
            isVerifiedStudent: profile.is_verified_student
          } : null
        };
      }
      return convo;
    })
  );

  return conversationsWithProfiles.map(c => ({
    id: c.id,
    participants: c.participants,
    listingId: c.listing_id,
    lastMessage: c.last_message,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    listing: c.listing,
    otherParticipant: c.otherParticipant
  }));
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
    createdAt: m.created_at,
    readAt: m.read_at
  } as Message));
};

export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  // Insert message
  const { data: message, error: msgError } = await supabase
    .from(MESSAGES_TABLE)
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
    .select()
    .single();

  if (msgError) throw msgError;

  // Update conversation metadata
  await supabase
    .from(CONVERSATIONS_TABLE)
    .update({
      last_message: content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  return {
    id: message.id,
    conversationId: message.conversation_id,
    senderId: message.sender_id,
    content: message.content,
    createdAt: message.created_at,
    readAt: message.read_at
  } as Message;
};

export const markAsRead = async (conversationId: string, userId: string) => {
  const { error } = await supabase
    .from(MESSAGES_TABLE)
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .is('read_at', null)
    .neq('sender_id', userId);

  if (error) throw error;
};

export const getOrCreateConversation = async (myId: string, otherId: string, listingId?: string) => {
  // Sort participants for consistent querying
  const participants = [myId, otherId].sort();

  // Check if conversation exists
  const { data: existing } = await supabase
    .from(CONVERSATIONS_TABLE)
    .select('*')
    .contains('participants', participants);

  // If we have a listingId, try to find a conversation tied to that listing
  if (listingId && existing) {
    const listingSpecific = existing.find(c => c.listing_id === listingId);
    if (listingSpecific) return listingSpecific.id;
  }

  // Return first existing conversation if no listing-specific needed
  if (existing && existing.length > 0) {
    return existing[0].id;
  }

  // Create new conversation
  const { data: created, error } = await supabase
    .from(CONVERSATIONS_TABLE)
    .insert({
      participants,
      listing_id: listingId || null,
    })
    .select()
    .single();

  if (error) throw error;
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
          createdAt: m.created_at,
          readAt: m.read_at
        } as Message);
      }
    )
    .subscribe();
};