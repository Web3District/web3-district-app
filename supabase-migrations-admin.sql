-- =====================================================
-- WEB4CITY ADMIN TABLES MIGRATION
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- =====================================================

-- 1. ADS TABLE (for ad campaigns management)
CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  campaign TEXT,
  image_url TEXT,
  logo_url TEXT,
  cta_text TEXT DEFAULT 'Learn More',
  cta_url TEXT,
  target_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  paid BOOLEAN NOT NULL DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  budget INTEGER DEFAULT 0,
  spent INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  type TEXT DEFAULT 'sky', -- sky, blimp, landmark, banner
  placement TEXT, -- specific placement identifier
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(active);
CREATE INDEX IF NOT EXISTS idx_ads_type ON ads(type);
CREATE INDEX IF NOT EXISTS idx_ads_dates ON ads(start_date, end_date);

-- Ad events tracking (impressions, clicks)
CREATE TABLE IF NOT EXISTS ad_events (
  id BIGSERIAL PRIMARY KEY,
  ad_id TEXT NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- impression, click, cta_click
  user_id TEXT,
  building_id INTEGER,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_events_ad_id ON ad_events(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_events_type ON ad_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ad_events_created ON ad_events(created_at);

-- 2. DROPS TABLE (for building drops/rewards)
CREATE TABLE IF NOT EXISTS drops (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL, -- aura, crown, effect, decoration
  item_id TEXT NOT NULL, -- reference to item in code
  rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary
  quantity INTEGER NOT NULL DEFAULT 1,
  remaining INTEGER NOT NULL DEFAULT 1,
  claim_limit INTEGER DEFAULT 1, -- per user
  active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  requirements JSONB DEFAULT '{}', -- {min_level: 5, district: 'web3'}
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drop_claims (
  id BIGSERIAL PRIMARY KEY,
  drop_id BIGINT NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(drop_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_drops_active ON drops(active);
CREATE INDEX IF NOT EXISTS idx_drops_dates ON drops(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_drop_claims_user ON drop_claims(user_id);

-- 3. EMAIL VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS email_verifications (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT,
  verified_at TIMESTAMPTZ,
  last_checked TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_verified ON email_verifications(verified);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);

-- 4. JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT DEFAULT 'Remote',
  type TEXT NOT NULL DEFAULT 'full-time', -- full-time, part-time, contract, internship
  url TEXT NOT NULL,
  description TEXT,
  salary_range TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(active);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(featured);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at);

-- 5. LANDMARKS TABLE
CREATE TABLE IF NOT EXISTS landmarks (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  ad_id TEXT REFERENCES ads(id), -- optional linked ad
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landmarks_active ON landmarks(active);
CREATE INDEX IF NOT EXISTS idx_landmarks_featured ON landmarks(featured);
CREATE INDEX IF NOT EXISTS idx_landmarks_location ON landmarks(lat, lng);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE landmarks ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for admin API)
CREATE POLICY "Service role has full access on ads"
  ON ads FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access on ad_events"
  ON ad_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access on drops"
  ON drops FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access on drop_claims"
  ON drop_claims FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access on email_verifications"
  ON email_verifications FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access on jobs"
  ON jobs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access on landmarks"
  ON landmarks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users can read active records
CREATE POLICY "Authenticated users can read active ads"
  ON ads FOR SELECT TO authenticated USING (active = true);

CREATE POLICY "Authenticated users can read active drops"
  ON drops FOR SELECT TO authenticated USING (active = true);

CREATE POLICY "Authenticated users can read active jobs"
  ON jobs FOR SELECT TO authenticated USING (active = true);

CREATE POLICY "Authenticated users can read active landmarks"
  ON landmarks FOR SELECT TO authenticated USING (active = true);

-- Users can read their own email verification
CREATE POLICY "Users can read own email verification"
  ON email_verifications FOR SELECT TO authenticated USING (auth.uid()::text = user_id);

-- Users can claim drops
CREATE POLICY "Authenticated users can claim drops"
  ON drop_claims FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Sample blimp ad
INSERT INTO ads (id, brand, campaign, image_url, cta_text, cta_url, type, placement, active, paid)
VALUES (
  'blimp-001',
  'Web3District',
  'Launch Campaign',
  'https://web4city.xyz/blimp.png',
  'Visit',
  'https://web4city.xyz',
  'blimp',
  'sky-center',
  true,
  false
) ON CONFLICT (id) DO NOTHING;

-- Sample job
INSERT INTO jobs (title, company, location, type, url, active, featured)
VALUES (
  'Senior Frontend Developer',
  'Web3District',
  'Remote',
  'full-time',
  'https://web4city.xyz/careers',
  true,
  false
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('ads', 'ad_events', 'drops', 'drop_claims', 'email_verifications', 'jobs', 'landmarks');

-- Count records in each table
SELECT 'ads' as table_name, COUNT(*) as count FROM ads
UNION ALL
SELECT 'ad_events', COUNT(*) FROM ad_events
UNION ALL
SELECT 'drops', COUNT(*) FROM drops
UNION ALL
SELECT 'drop_claims', COUNT(*) FROM drop_claims
UNION ALL
SELECT 'email_verifications', COUNT(*) FROM email_verifications
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'landmarks', COUNT(*) FROM landmarks;
