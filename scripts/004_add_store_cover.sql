-- Add store cover URL column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS store_cover_url TEXT;
