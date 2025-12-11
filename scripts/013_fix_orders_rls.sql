-- Fix orders table RLS policies
-- This script is safe to run multiple times

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;

-- Recreate the insert policy to allow authenticated users to create orders
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also allow buyers to view their own orders
DROP POLICY IF EXISTS "Buyers can view their orders" ON orders;
CREATE POLICY "Buyers can view their orders"
  ON orders FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

-- Display current policies for verification
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'orders';
