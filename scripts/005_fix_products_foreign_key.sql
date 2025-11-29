-- Drop the existing foreign key constraint to auth.users
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_seller_id_fkey;

-- Add foreign key to profiles table instead
ALTER TABLE public.products
ADD CONSTRAINT products_seller_id_fkey 
FOREIGN KEY (seller_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
