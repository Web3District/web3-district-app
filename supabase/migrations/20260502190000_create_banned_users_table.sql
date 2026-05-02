-- Create banned_users table for user moderation
CREATE TABLE IF NOT EXISTS banned_users (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT 'Banned by admin',
  banned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  banned_by TEXT,
  UNIQUE(user_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON banned_users(user_id);

-- Enable RLS
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access"
  ON banned_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow read access to authenticated users (for admin checks)
CREATE POLICY "Authenticated users can read"
  ON banned_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Comment
COMMENT ON TABLE banned_users IS 'Tracks banned/suspended users for moderation';
