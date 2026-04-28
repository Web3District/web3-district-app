-- Fix: Set home_district based on primary_language for ALL developers
-- Run this in Supabase SQL Editor

-- Step 1: Set home_district based on primary_language
UPDATE developers 
SET home_district = CASE
  WHEN primary_language IN ('Python', 'Jupyter Notebook', 'R', 'Julia') THEN 'ai'
  WHEN primary_language IN ('Solidity', 'Vyper') THEN 'web3'
  WHEN primary_language IN ('Q', 'Q#') THEN 'quantum'
  WHEN primary_language IS NULL THEN 'growth'
  ELSE 'growth'
END
WHERE home_district IS NULL;

-- Step 2: Set district = home_district for unclaimed developers
UPDATE developers 
SET district = home_district
WHERE claimed = false AND district IS NULL;

-- Step 3: Ensure all claimed developers are in downtown
UPDATE developers 
SET district = 'downtown'
WHERE claimed = true;

-- Verify the fix
SELECT 
  district,
  home_district,
  claimed,
  COUNT(*) as count
FROM developers
GROUP BY district, home_district, claimed
ORDER BY district, home_district, claimed;
