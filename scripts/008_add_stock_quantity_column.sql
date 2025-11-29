-- Add stock_quantity column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0 NOT NULL;

-- Add a check constraint to ensure stock is not negative
ALTER TABLE public.products 
ADD CONSTRAINT products_stock_quantity_check CHECK (stock_quantity >= 0);
