-- Update the orders table status check constraint to include 'approved'
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint with 'approved' status
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'accepted', 'approved', 'refused', 'completed'));
