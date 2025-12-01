-- Fix orders table schema - Add buyer_id column if missing and ensure buyer_email exists
-- This script is safe to run multiple times

-- Add buyer_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='buyer_id') THEN
        ALTER TABLE orders ADD COLUMN buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
        
        -- Update the RLS policies to allow buyers to view their own orders
        CREATE POLICY "Buyers can view their orders"
          ON orders FOR SELECT
          USING (buyer_id = auth.uid());
    END IF;
END $$;

-- Ensure buyer_email column exists (it should already exist from 006_create_orders_table.sql)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='buyer_email') THEN
        ALTER TABLE orders ADD COLUMN buyer_email TEXT NOT NULL DEFAULT 'unknown@email.com';
    END IF;
END $$;

-- Display the current orders table schema for verification
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
