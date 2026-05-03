-- =====================================================
-- WEB4CITY ADMIN - CLEAN SETUP
-- Run in: https://supabase.com/dashboard/project/rhppbqsuktyunxfwnddp/sql/new
-- =====================================================

-- 1. ADS TABLE
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
  type TEXT DEFAULT 'sky',
  placement TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. AD EVENTS TABLE
CREATE TABLE IF NOT EXISTS ad_events (
  id BIGSERIAL PRIMARY KEY,
  ad_id TEXT NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  user_id TEXT,
  building_id INTEGER,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DROPS TABLE
CREATE TABLE IF NOT EXISTS drops (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  quantity INTEGER NOT NULL DEFAULT 1,
  remaining INTEGER NOT NULL DEFAULT 1,
  claim_limit INTEGER DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  requirements JSONB DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DROP CLAIMS TABLE
CREATE TABLE IF NOT EXISTS drop_claims (
  id BIGSERIAL PRIMARY KEY,
  drop_id BIGINT NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(drop_id, user_id)
);

-- 5. EMAIL VERIFICATIONS TABLE
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

-- 6. JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT DEFAULT 'Remote',
  type TEXT NOT NULL DEFAULT 'full-time',
  url TEXT NOT NULL,
  description TEXT,
  salary_range TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. LANDMARKS TABLE
CREATE TABLE IF NOT EXISTS landmarks (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  ad_id TEXT REFERENCES ads(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES (IF NOT EXISTS)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(active);
CREATE INDEX IF NOT EXISTS idx_ads_type ON ads(type);
CREATE INDEX IF NOT EXISTS idx_ad_events_ad_id ON ad_events(ad_id);
CREATE INDEX IF NOT EXISTS idx_drops_active ON drops(active);
CREATE INDEX IF NOT EXISTS idx_drop_claims_user ON drop_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_verified ON email_verifications(verified);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(active);
CREATE INDEX IF NOT EXISTS idx_landmarks_active ON landmarks(active);

-- =====================================================
-- ENABLE RLS (IF NOT ALREADY)
-- =====================================================
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE landmarks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP EXISTING POLICIES (TO AVOID CONFLICTS)
-- =====================================================
DO $$
BEGIN
  -- Drop ads policies
  DROP POLICY IF EXISTS "Service role has full access on ads" ON ads;
  DROP POLICY IF EXISTS "Authenticated users can read active ads" ON ads;
  
  -- Drop ad_events policies
  DROP POLICY IF EXISTS "Service role has full access on ad_events" ON ad_events;
  
  -- Drop drops policies
  DROP POLICY IF EXISTS "Service role has full access on drops" ON drops;
  DROP POLICY IF EXISTS "Authenticated users can read active drops" ON drops;
  
  -- Drop drop_claims policies
  DROP POLICY IF EXISTS "Service role has full access on drop_claims" ON drop_claims;
  DROP POLICY IF EXISTS "Authenticated users can claim drops" ON drop_claims;
  
  -- Drop email_verifications policies
  DROP POLICY IF EXISTS "Service role has full access on email_verifications" ON email_verifications;
  DROP POLICY IF EXISTS "Users can read own email verification" ON email_verifications;
  
  -- Drop jobs policies
  DROP POLICY IF EXISTS "Service role has full access on jobs" ON jobs;
  DROP POLICY IF EXISTS "Authenticated users can read active jobs" ON jobs;
  
  -- Drop landmarks policies
  DROP POLICY IF EXISTS "Service role has full access on landmarks" ON landmarks;
  DROP POLICY IF EXISTS "Authenticated users can read active landmarks" ON landmarks;
END $$;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Service role has full access
CREATE POLICY "Service role has full access on ads" ON ads FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access on ad_events" ON ad_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access on drops" ON drops FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access on drop_claims" ON drop_claims FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access on email_verifications" ON email_verifications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access on jobs" ON jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access on landmarks" ON landmarks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users can read active records
CREATE POLICY "Authenticated users can read active ads" ON ads FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "Authenticated users can read active drops" ON drops FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "Authenticated users can read active jobs" ON jobs FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "Authenticated users can read active landmarks" ON landmarks FOR SELECT TO authenticated USING (active = true);

-- Users can read own email verification
CREATE POLICY "Users can read own email verification" ON email_verifications FOR SELECT TO authenticated USING (auth.uid()::text = user_id);

-- Users can claim drops
CREATE POLICY "Authenticated users can claim drops" ON drop_claims FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);

-- =====================================================
-- INSERT SAMPLE BLIMP AD
-- =====================================================
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
) ON CONFLICT (id) DO UPDATE SET
  brand = EXCLUDED.brand,
  image_url = EXCLUDED.image_url,
  active = EXCLUDED.active,
  updated_at = NOW();

-- =====================================================
-- VERIFY SETUP
-- =====================================================
SELECT 'ads' as table_name, COUNT(*) as count FROM ads
UNION ALL SELECT 'ad_events', COUNT(*) FROM ad_events
UNION ALL SELECT 'drops', COUNT(*) FROM drops
UNION ALL SELECT 'drop_claims', COUNT(*) FROM drop_claims
UNION ALL SELECT 'email_verifications', COUNT(*) FROM email_verifications
UNION ALL SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL SELECT 'landmarks', COUNT(*) FROM landmarks;
