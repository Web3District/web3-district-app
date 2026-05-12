-- Add loadout column to landmarks table for shop item customization
-- Run this in Supabase SQL Editor

ALTER TABLE landmarks 
ADD COLUMN IF NOT EXISTS loadout JSONB DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN landmarks.loadout IS 'Shop item loadout: { crown: item_id, roof: item_id, aura: item_id }';
