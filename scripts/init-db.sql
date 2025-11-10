-- Database initialization script for Cyclists Social Network
-- Run this script to create the necessary database schema

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  bike_type VARCHAR(20) NOT NULL CHECK (bike_type IN ('road', 'mountain', 'hybrid', 'electric', 'gravel', 'other')),
  city VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  date_of_birth DATE,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Create index on city for location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);

-- Create index on level and bike_type for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level);
CREATE INDEX IF NOT EXISTS idx_profiles_bike_type ON profiles(bike_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Example: Insert sample data (optional - comment out if not needed)
-- INSERT INTO profiles (user_id, level, bike_type, city, bio) VALUES
--   ('00000000-0000-0000-0000-000000000001'::UUID, 'intermediate', 'road', 'San Francisco', 'Love cycling along the coast!'),
--   ('00000000-0000-0000-0000-000000000002'::UUID, 'advanced', 'mountain', 'Boulder', 'Mountain biking enthusiast'),
--   ('00000000-0000-0000-0000-000000000003'::UUID, 'beginner', 'hybrid', 'Portland', 'Just getting started with cycling');

-- Grant necessary permissions (adjust based on your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO your_app_user;
