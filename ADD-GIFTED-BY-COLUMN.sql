-- Add gifted_by column to purchases table for admin gift tracking
-- Run this in Supabase SQL Editor

ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS gifted_by UUID DEFAULT NULL REFERENCES auth.users(id);

ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS message TEXT DEFAULT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchases_gifted_by ON purchases(gifted_by);
CREATE INDEX IF NOT EXISTS idx_purchases_provider_free ON purchases(provider) WHERE provider = 'free';

-- Add comments
COMMENT ON COLUMN purchases.gifted_by IS 'Admin user ID who sent this as a gift';
COMMENT ON COLUMN purchases.message IS 'Optional message from gift sender';
