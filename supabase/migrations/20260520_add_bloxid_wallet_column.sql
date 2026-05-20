-- Add BloxID wallet column to developers table
-- Enables Thirdweb wallet integration for Web4City
-- Created: 2026-05-20

-- Add bloxid_wallet column (stores Ethereum address)
ALTER TABLE developers
ADD COLUMN IF NOT EXISTS bloxid_wallet TEXT UNIQUE;

-- Add index for faster wallet lookups
CREATE INDEX IF NOT EXISTS idx_developers_bloxid_wallet ON developers(bloxid_wallet);

-- Add comment for documentation
COMMENT ON COLUMN developers.bloxid_wallet IS 'Thirdweb wallet address for BloxID integration (created asynchronously after GitHub login)';

-- Grant permissions (wallet should be readable by authenticated users for their own record)
-- RLS policies should handle row-level security
