-- Migration: Add home_district column to developers
-- Run this in Supabase SQL Editor

-- Add home_district column (stores user's identity: ai, web3, quantum, growth, vc)
ALTER TABLE developers 
ADD COLUMN IF NOT EXISTS home_district TEXT;

-- Add district column (stores location: downtown, ai, web3, quantum, growth, vc)
ALTER TABLE developers 
ADD COLUMN IF NOT EXISTS district TEXT;

-- Set existing AI developers to home_district = ai, district = ai
UPDATE developers 
SET home_district = 'ai', district = 'ai' 
WHERE district = 'ai' OR district = 'data_ai';

-- Set existing Web3 developers
UPDATE developers 
SET home_district = 'web3', district = 'web3' 
WHERE district = 'web3';

-- Set existing Quantum developers
UPDATE developers 
SET home_district = 'quantum', district = 'quantum' 
WHERE district = 'quantum';

-- Set existing Growth developers
UPDATE developers 
SET home_district = 'growth', district = 'growth' 
WHERE district = 'growth';

-- Set existing VC developers
UPDATE developers 
SET home_district = 'vc', district = 'vc' 
WHERE district = 'vc';

-- Add downtown district to districts table
INSERT INTO districts (id, name, color) 
VALUES ('downtown', 'Downtown', '#ffffff')
ON CONFLICT (id) DO NOTHING;

-- Add comment for documentation
COMMENT ON COLUMN developers.home_district IS 'User identity district (ai, web3, quantum, growth, vc) - determines building color';
COMMENT ON COLUMN developers.district IS 'Physical location district (downtown for real users, or their home_district for unclaimed)';
