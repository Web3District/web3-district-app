-- Districts Table Migration
-- Run this in Supabase SQL Editor to create the districts table

CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT DEFAULT '',
  population INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read districts
CREATE POLICY "Anyone can view districts"
  ON districts FOR SELECT
  TO authenticated
  USING (true);

-- Allow admin users to manage districts
CREATE POLICY "Admins can manage districts"
  ON districts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_districts_name ON districts(name);

-- Insert default districts (only if table is empty)
INSERT INTO districts (id, name, color, description)
SELECT * FROM (VALUES
  ('web3', 'Web3', '#8b5cf6', 'Blockchain, crypto, and decentralized future.'),
  ('ai', 'AI', '#ec4899', 'Machine learning, neural networks, and intelligent systems.'),
  ('quantum', 'Quantum', '#06b6d4', 'Quantum computing, physics, and next-gen algorithms.'),
  ('vc', 'VC', '#f97316', 'Venture capital, startups, and investment ecosystem.'),
  ('growth', 'Growth', '#10b981', 'Marketing, community, and scaling strategies.')
) AS v(id, name, color, description)
WHERE NOT EXISTS (SELECT 1 FROM districts);
