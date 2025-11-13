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
