-- Migration: Create database schema for Cycling Network Platform
-- Description: Creates tables for users and cyclist profiles
-- PostgreSQL version: 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (replaces Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create cyclist_profiles table
CREATE TABLE IF NOT EXISTS cyclist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Create indexes on cyclist_profiles
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_user_id ON cyclist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_email ON cyclist_profiles(email);
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_location ON cyclist_profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_city ON cyclist_profiles(city);
CREATE INDEX IF NOT EXISTS idx_cyclist_profiles_level ON cyclist_profiles(level);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update updated_at on cyclist_profiles table
CREATE TRIGGER update_cyclist_profiles_updated_at
  BEFORE UPDATE ON cyclist_profiles
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

-- Function to auto-create cyclist profile when user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO cyclist_profiles (user_id, email, photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    generate_avatar_url(NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on users to auto-create cyclist profile
DROP TRIGGER IF EXISTS on_user_created ON users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Insert test user for development (password: password123)
-- Password hash generated with bcrypt, cost factor 10
INSERT INTO users (email, password_hash) 
VALUES (
  'test@cycling.local',
  '$2b$10$rKvVPbXELFhJc4tJJGJnTuYxWDKHW.Yx7YKUHKKNpLCCJX7XZvLG2'
) ON CONFLICT (email) DO NOTHING;

-- Grant permissions (for local development)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cycling_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cycling_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO cycling_user;
