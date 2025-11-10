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
