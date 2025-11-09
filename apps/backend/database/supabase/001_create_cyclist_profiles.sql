-- ============================================
-- Cycling Network Platform - Database Schema
-- ============================================
-- This migration creates the cyclist_profiles table
-- and sets up Row Level Security (RLS) policies
-- 
-- Run this in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste and Run
-- ============================================

-- Create cyclist_profiles table
CREATE TABLE IF NOT EXISTS public.cyclist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  sex TEXT CHECK (sex IN ('male', 'female', 'other', 'prefer_not_to_say')),
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'professional')),
  birth_date DATE,
  photo_url TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  bike_type TEXT CHECK (bike_type IN ('road', 'mountain', 'hybrid', 'gravel', 'electric', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_user_id ON public.cyclist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_email ON public.cyclist_profiles(email);
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_city ON public.cyclist_profiles(city);
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_level ON public.cyclist_profiles(level);
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_location ON public.cyclist_profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.cyclist_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view all profiles (public read access)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.cyclist_profiles
  FOR SELECT
  USING (true);

-- RLS Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.cyclist_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.cyclist_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON public.cyclist_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_cyclist_profiles_updated_at ON public.cyclist_profiles;
CREATE TRIGGER update_cyclist_profiles_updated_at
  BEFORE UPDATE ON public.cyclist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create cyclist profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.cyclist_profiles (user_id, email, photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    'https://ui-avatars.com/api/?name=' || COALESCE(SPLIT_PART(NEW.email, '@', 1), 'User') || '&background=random&size=200'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.cyclist_profiles TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- Migration Complete!
-- ============================================
-- Your database is now ready. 
-- Profiles will be automatically created when users sign up.
-- Auto-generated avatars use email initials.
--
-- Test by:
-- 1. Sign up a new user in your app
-- 2. Check the cyclist_profiles table
-- 3. Profile should appear automatically
-- ============================================
