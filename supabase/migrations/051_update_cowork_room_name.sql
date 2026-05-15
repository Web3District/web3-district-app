-- 051_update_cowork_room_name.sql
-- Rename last featured COWORK room to "Web4City Agency"
-- Run in Supabase SQL Editor or apply as migration

-- Update Growth District Lounge → Web4City Agency (last featured room)
UPDATE arcade_rooms
SET 
  name = 'Web4City Agency',
  description = 'Official Web4City agency room',
  updated_at = now()
WHERE slug = 'growth-lobby';

-- Verify all featured rooms
SELECT slug, name, description, is_featured 
FROM arcade_rooms 
WHERE is_featured = true 
ORDER BY created_at ASC;
