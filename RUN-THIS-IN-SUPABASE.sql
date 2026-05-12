-- Run this in Supabase SQL Editor: https://rhppbqsuktyunxfwnddp.supabase.co
-- Go to SQL Editor → New Query → Paste → Run

-- Add grid positioning and custom model support to landmarks table
ALTER TABLE landmarks 
  ADD COLUMN IF NOT EXISTS grid_x INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grid_z INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS building_type TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#ed0584',
  ADD COLUMN IF NOT EXISTS model_url TEXT,
  ADD COLUMN IF NOT EXISTS hitbox_radius INTEGER DEFAULT 80,
  ADD COLUMN IF NOT EXISTS hitbox_height INTEGER DEFAULT 550;

-- Add comment for documentation
COMMENT ON COLUMN landmarks.grid_x IS 'Grid X position in city (matches gridToWorldPos system)';
COMMENT ON COLUMN landmarks.grid_z IS 'Grid Z position in city (matches gridToWorldPos system)';
COMMENT ON COLUMN landmarks.building_type IS 'Type of 3D building: default, corporate, tech_hub, custom';
COMMENT ON COLUMN landmarks.model_url IS 'URL to custom GLB model file (Supabase Storage)';

-- Create index for fast spatial queries
CREATE INDEX IF NOT EXISTS landmarks_grid_position_idx ON landmarks(grid_x, grid_z) WHERE active = true;

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'landmarks' 
  AND column_name IN ('grid_x', 'grid_z', 'building_type', 'accent_color', 'model_url', 'hitbox_radius', 'hitbox_height');
