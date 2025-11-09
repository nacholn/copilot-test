-- Migration: Create cyclist_profiles table
-- Description: Stores detailed cyclist profile information
-- Run this in your Supabase SQL Editor: https://app.supabase.com

-- Create cyclist_profiles table
CREATE TABLE IF NOT EXISTS public.cyclist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_user_id ON public.cyclist_profiles(user_id);

-- Create index on email for searches
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_email ON public.cyclist_profiles(email);

-- Create index on location for proximity searches
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_location ON public.cyclist_profiles(latitude, longitude);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cyclist_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles
CREATE POLICY "Anyone can view cyclist profiles"
  ON public.cyclist_profiles
  FOR SELECT
  USING (true);

-- Policy: Users can only insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.cyclist_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.cyclist_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON public.cyclist_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on profile changes
CREATE TRIGGER update_cyclist_profiles_updated_at
  BEFORE UPDATE ON public.cyclist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate avatar initials URL
CREATE OR REPLACE FUNCTION generate_avatar_url(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
  initials TEXT;
  color TEXT;
BEGIN
  -- Extract initials from email (first 2 characters before @)
  initials := UPPER(LEFT(SPLIT_PART(p_email, '@', 1), 2));
  
  -- Generate a color based on email hash
  color := LPAD(TO_HEX((hashtext(p_email) & 16777215)::INTEGER), 6, '0');
  
  -- Return UI Avatars URL
  RETURN 'https://ui-avatars.com/api/?name=' || initials || '&background=' || color || '&color=fff&size=200';
END;
$$ LANGUAGE plpgsql;

-- Create or update cyclist profile on user signup (trigger function)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.cyclist_profiles (user_id, email, photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    generate_avatar_url(NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users to auto-create cyclist profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.cyclist_profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
