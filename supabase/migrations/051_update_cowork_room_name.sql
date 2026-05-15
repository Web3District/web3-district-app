-- 051_update_cowork_room_name.sql
-- Rename E.Arcade Lobby → Web4City Agency
-- Run in Supabase SQL Editor or apply as migration

-- Update E.Arcade Lobby → Web4City Agency (last room in the list)
UPDATE arcade_rooms
SET 
  name = 'Web4City Agency',
  description = 'Official Web4City agency room',
  updated_at = now()
WHERE slug = 'lobby';

-- Verify all featured rooms
SELECT slug, name, description, is_featured 
FROM arcade_rooms 
WHERE is_featured = true 
ORDER BY created_at ASC;
