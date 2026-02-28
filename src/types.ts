// OneStack - Campus Marketplace Types

export type ListingType = 'buy' | 'sell' | 'service';
export type Condition = 'new' | 'like_new' | 'good' | 'fair' | 'for_parts';

export const LISTING_CATEGORIES = [
  'Electronics',
  'Books',
  'Furniture',
  'Clothing',
  'Sports',
  'Other',
] as const;

export const SERVICE_CATEGORIES = [
  'Hair',
  'Laundry',
  'Tutoring',
  'Repairs',
  'Design',
  'Photography',
  'Delivery',
  'Other',
] as const;

export type ItemCategory = (typeof LISTING_CATEGORIES)[number];
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export interface University {
  id: string;
  name: string;
  country: string;
  campuses: Campus[];
}

export interface Campus {
  id: string;
  name: string;
  universityId: string;
  city?: string;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  displayName: string;
  photoURL?: string;
  universityId: string;
  campusId: string;
  isVerifiedStudent: boolean;
  trustScore: number;
  createdAt: string;
  role: 'user' | 'admin' | 'moderator';
}

export interface Listing {
  id: string;
  userId: string;
  type: ListingType;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: ItemCategory | ServiceCategory;
  condition?: Condition;
  images: string[];
  location: string;
  campusId: string;
  universityId: string;
  isPremium: boolean;
  status: 'active' | 'sold' | 'removed' | 'pending';
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  favoriteCount?: number;
}

export interface ChatRoom {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  type: 'listing' | 'user' | 'message';
  targetId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface NotificationPayload {
  type: 'message' | 'listing_activity' | 'promotion' | 'review' | 'favorite';
  title: string;
  body?: string;
  data?: Record<string, string>;
}
