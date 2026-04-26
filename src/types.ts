// OneStack — TypeScript Types (v2.1)
// Synchronized with definitive database schema

export type ListingType = 'buy' | 'sell' | 'service';
export type Condition = 'new' | 'like_new' | 'good' | 'fair' | 'poor' | 'for_parts';

export const LISTING_CATEGORIES = [
  'Textbooks',
  'Electronics',
  'Furniture',
  'Clothing',
  'Housing',
  'Tickets',
  'Services',
  'Free',
  'Other',
] as const;

export const SERVICE_CATEGORIES = [
  'Tutoring',
  'Writing',
  'Tech Support',
  'Creative',
  'Cleaning',
  'Delivery',
  'Moving',
  'Other',
] as const;

export type ItemCategory = (typeof LISTING_CATEGORIES)[number];

// ─── Campuses ────────────────────────────────────────────────────────────────

export interface Campus {
  id: string;
  name: string;
  code: string;
  city?: string;
  state?: string;
  country: string;
  timezone: string;
  isActive: boolean;
}

// ─── Users & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email?: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  coverUrl?: string;
  subscriptionTier?: 'free' | 'pro' | 'business';
  bio?: string;
  campusId?: string;
  major?: string;
  graduationYear?: number;
  isVerified: boolean;
  verificationType?: 'email' | 'student_id' | 'admin';
  trustScore: number;
  isBanned: boolean;
  notificationPreferences: {
    push: boolean;
    email: boolean;
    likes: boolean;
    comments: boolean;
    follows: boolean;
    messages: boolean;
    marketplace: boolean;
  };
  privacySettings: {
    profileVisibility: 'public' | 'private' | 'campus';
    showOnlineStatus: boolean;
    allowMessagesFrom: 'everyone' | 'followers' | 'no_one';
  };
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Feed & Posts ─────────────────────────────────────────────────────────────

export type PostCategory = 
  | 'Marketplace' | 'Services' | 'Deals' | 'Jobs' 
  | 'Announcements' | 'General' | 'Question' | 'Event';

export interface Post {
  id: string;
  userId: string;
  campusId: string;
  content: string;
  images: string[];
  category: PostCategory;
  hashtags: string[];
  visibility: 'campus' | 'all_campuses' | 'followers';
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  trendingScore: number;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: Partial<User>;
}

export interface SearchResults {
  posts: Post[];
  listings: Listing[];
  users: Partial<User>[];
}

export interface Comment {
  id: string;
  postId?: string;
  listingId?: string;
  userId: string;
  parentCommentId?: string;
  content: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author?: Partial<User>;
  replies?: Comment[];
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  userId: string;
  campusId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: ItemCategory;
  type: ListingType;
  condition?: Condition;
  images: string[];
  status: 'active' | 'sold' | 'reserved' | 'expired' | 'deleted';
  isPremium?: boolean;
  isNegotiable: boolean;
  meetupLocation?: string;
  tags: string[];
  viewCount: number;
  inquiryCount: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  author?: Partial<User>;
}

// ─── Chat System (Normalized) ─────────────────────────────────────────────────

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  title?: string;
  iconUrl?: string;
  createdBy?: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  // Derived / Joined data
  participants?: Participant[];
  otherParticipant?: Partial<User>;
  lastMessage?: string;
  unreadCount?: number;
}

export interface Participant {
  id: string;
  conversationId: string;
  userId: string;
  role: 'admin' | 'member';
  lastReadAt: string;
  isMuted: boolean;
  isArchived: boolean;
  joinedAt: string;
  // profile join
  user?: Partial<User>;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  replyToId?: string;
  content: string;
  mediaUrls: string[];
  mediaType?: 'image' | 'video' | 'file' | 'audio' | 'location';
  isEdited: boolean;
  isDeleted: boolean;
  reactions: Record<string, string[]>; // emoji -> userIds
  readBy: string[]; // userIds
  deliveredTo: string[]; // userIds
  createdAt: string;
  updatedAt: string;
}

// ─── Stories ──────────────────────────────────────────────────────────────────

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
  caption?: string;
  campusId: string;
  backgroundColor: string;
  textOverlay?: string;
  stickerData: any[];
  expiresAt: string;
  viewCount: number;
  createdAt: string;
  author?: Partial<User>;
  hasViewed?: boolean;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'like' | 'comment' | 'reply' | 'mention' | 'follow' | 'follow_request'
  | 'message' | 'listing_sold' | 'price_drop' | 'listing_inquiry'
  | 'story_view' | 'story_reaction' | 'welcome' | 'announcement'
  | 'verification_approved' | 'verification_rejected';

export interface Notification {
  id: string;
  userId: string;
  actorId?: string;
  type: NotificationType;
  entityType: 'post' | 'listing' | 'comment' | 'story' | 'user' | 'conversation' | 'review';
  entityId?: string;
  message: string;
  data: any;
  deepLink?: string;
  readAt?: string;
  isSeen: boolean;
  createdAt: string;
  actor?: Partial<User>;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  userId: string;
  planTier: 'free' | 'pro' | 'business';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired';
  currentPeriodEnd: string;
  stripeSubscriptionId?: string;
}

// ─── Social ───────────────────────────────────────────────────────────────────

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  listingId?: string;
  rating: number;
  comment?: string;
  aspects?: Record<string, number>;
  isAnonymous?: boolean;
  revieweeResponse?: string;
  respondedAt?: string;
  createdAt: string;
  reviewer?: {
    fullName: string;
    avatarUrl?: string;
  };
}
