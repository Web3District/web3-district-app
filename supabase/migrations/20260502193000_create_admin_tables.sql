-- Quest Definitions table
CREATE TABLE IF NOT EXISTS quest_definitions (
  id BIGSERIAL PRIMARY KEY,
  quest_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'personal',
  title TEXT NOT NULL,
  description TEXT,
  requirements JSONB NOT NULL DEFAULT '{}',
  gblx_cost INTEGER NOT NULL DEFAULT 0,
  reward_gblx INTEGER NOT NULL DEFAULT 0,
  reward_aura INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quest_definitions_status ON quest_definitions(status);
CREATE INDEX IF NOT EXISTS idx_quest_definitions_sort ON quest_definitions(sort_order);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  verified_partner BOOLEAN NOT NULL DEFAULT false,
  is_event BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_name ON venues(name);
CREATE INDEX IF NOT EXISTS idx_venues_verified ON venues(verified_partner);

-- App Content table (CMS)
CREATE TABLE IF NOT EXISTS app_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  web4city_title TEXT NOT NULL DEFAULT 'Web4City',
  web4city_subtitle TEXT NOT NULL DEFAULT 'Your GitHub as a 3D City',
  wallet_button_text TEXT NOT NULL DEFAULT 'Connect Wallet',
  wallet_button_link TEXT,
  featured_image_passport TEXT,
  featured_image_quest TEXT,
  explore_title TEXT NOT NULL DEFAULT 'Explore City',
  explore_subtitle TEXT NOT NULL DEFAULT 'Browse Buildings',
  featured_image_explore TEXT,
  lobby_title TEXT NOT NULL DEFAULT 'Lobby',
  lobby_subtitle TEXT NOT NULL DEFAULT 'Meet other devs',
  featured_image_lobby TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT app_content_single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE quest_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_content ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access on quest_definitions"
  ON quest_definitions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access on venues"
  ON venues FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access on app_content"
  ON app_content FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users can read
CREATE POLICY "Authenticated users can read quest_definitions"
  ON quest_definitions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read venues"
  ON venues FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read app_content"
  ON app_content FOR SELECT TO authenticated USING (true);

-- Comments
COMMENT ON TABLE quest_definitions IS 'Quest definitions for user missions';
COMMENT ON TABLE venues IS 'Physical locations for check-ins and events';
COMMENT ON TABLE app_content IS 'CMS content for app texts and images';
