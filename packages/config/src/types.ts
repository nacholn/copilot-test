// User types
export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

// Profile types
export interface Profile {
  id: string;
  userId: string;
  email: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  bikeType: 'road' | 'mountain' | 'hybrid' | 'electric' | 'gravel' | 'other';
  city: string;
  latitude?: number;
  longitude?: number;
  dateOfBirth?: Date;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfileInput {
  userId: string;
  email: string;
  name: string;
  level: Profile['level'];
  bikeType: Profile['bikeType'];
  city: string;
  latitude?: number;
  longitude?: number;
  dateOfBirth?: Date;
  avatar?: string;
  bio?: string;
}

export interface UpdateProfileInput {
  email?: string;
  name?: string;
  level?: Profile['level'];
  bikeType?: Profile['bikeType'];
  city?: string;
  latitude?: number;
  longitude?: number;
  dateOfBirth?: Date;
  avatar?: string;
  bio?: string;
}

// Auth types
export interface RegisterInput {
  email: string;
  password: string;
  profile: Omit<CreateProfileInput, 'userId'>;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RecoverPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Friendship types
export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  createdAt: Date;
}

export interface FriendProfile extends Profile {
  friendshipId: string;
}

export interface AddFriendInput {
  userId: string;
  friendId: string;
}

// User listing types
export interface UserSearchParams {
  query?: string;
  level?: Profile['level'];
  bikeType?: Profile['bikeType'];
  city?: string;
}

// Profile Image types
export interface ProfileImage {
  id: string;
  userId: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: Date;
}

export interface UploadImageInput {
  userId: string;
  isPrimary?: boolean;
}

// Message types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface SendMessageInput {
  senderId: string;
  receiverId: string;
  message: string;
}

export interface Conversation {
  friendId: string;
  friendName: string;
  friendAvatar?: string;
  lastMessage?: Message;
  unreadCount: number;
}

// Friend Request types
export interface FriendRequest {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequestWithProfile extends FriendRequest {
  requesterName: string;
  requesterAvatar?: string;
  requesterEmail: string;
}

export interface SendFriendRequestInput {
  requesterId: string;
  addresseeId: string;
}

export interface UpdateFriendRequestInput {
  requestId: string;
  status: 'accepted' | 'rejected';
}

// Notification types
export type NotificationType = 'friend_request' | 'friend_request_accepted' | 'message' | 'system' | 'post_reply' | 'new_post';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actorId?: string;
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  createdAt: Date;
}

export interface NotificationWithActor extends Notification {
  actorName?: string;
  actorAvatar?: string;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actorId?: string;
  relatedId?: string;
  relatedType?: string;
  actionUrl?: string;
}

// User Status types
export type UserStatusType = 'online' | 'offline' | 'away';

export interface UserStatus {
  userId: string;
  status: UserStatusType;
  lastSeen: Date;
  updatedAt: Date;
}

// Post types
export type PostVisibility = 'public' | 'friends';

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  visibility: PostVisibility;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostImage {
  id: string;
  postId: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  displayOrder: number;
  createdAt: Date;
}

export interface PostReply {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface PostView {
  id: string;
  postId: string;
  userId: string;
  lastReplyCountSeen: number;
  viewedAt: Date;
}

export interface PostWithDetails extends Post {
  authorName: string;
  authorAvatar?: string;
  images: PostImage[];
  replyCount: number;
  hasNewActivity?: boolean;
}

export interface PostReplyWithAuthor extends PostReply {
  authorName: string;
  authorAvatar?: string;
}

export interface CreatePostInput {
  userId: string;
  title: string;
  content: string;
  visibility: PostVisibility;
  images?: Array<{
    imageUrl: string;
    cloudinaryPublicId: string;
  }>;
}

export interface CreatePostReplyInput {
  postId: string;
  userId: string;
  content: string;
}
