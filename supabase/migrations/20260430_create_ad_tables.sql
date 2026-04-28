-- Web4City - Ad Campaign Tables
-- Created: 2026-04-30
-- Purpose: Support Sky Ads monetization (Foundation & Skyline packages)

-- Ad packages table
CREATE TABLE IF NOT EXISTS ad_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_usd_cents INTEGER NOT NULL,
  price_brl_cents INTEGER NOT NULL,
  features JSONB,
  stripe_product_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad campaigns table (tracks customer purchases)
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  package_id UUID REFERENCES ad_packages(id),
  stripe_session_id TEXT,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, active, paused, cancelled, expired
  brand TEXT,
  text TEXT,
  color TEXT,
  bgColor TEXT,
  link TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad impressions table (for tracking views/clicks)
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ad_campaigns(id),
  impression_type TEXT, -- view, click, hover
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default packages
INSERT INTO ad_packages (name, price_usd_cents, price_brl_cents, features, stripe_product_id) VALUES
  ('foundation', 9700, 49700, '["2 Rooftop Signs", "~63K impressions/mo", "Real-time stats", "Cancel anytime"]', 'prod_UQluV89C423P9s'),
  ('skyline', 19700, 99700, '["2 Rooftop Signs", "Blimp", "LED Wrap", "Plane", "200K+ impressions/mo"]', 'prod_UQluWiKjIqL7FQ')
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_user ON ad_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_stripe ON ad_campaigns(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad ON ad_impressions(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_created ON ad_impressions(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ad_campaigns
DROP POLICY IF EXISTS "Users can view own campaigns" ON ad_campaigns;
CREATE POLICY "Users can view own campaigns"
  ON ad_campaigns FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own campaigns" ON ad_campaigns;
CREATE POLICY "Users can insert own campaigns"
  ON ad_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own campaigns" ON ad_campaigns;
CREATE POLICY "Users can update own campaigns"
  ON ad_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for ad_impressions
DROP POLICY IF EXISTS "Users can view own impressions" ON ad_impressions;
CREATE POLICY "Users can view own impressions"
  ON ad_impressions FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM ad_campaigns 
      WHERE ad_campaigns.id = ad_impressions.ad_id 
      AND ad_campaigns.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can insert impressions" ON ad_impressions;
CREATE POLICY "System can insert impressions"
  ON ad_impressions FOR INSERT
  WITH CHECK (true);

-- Grant permissions to service role
GRANT ALL ON ad_packages TO service_role;
GRANT ALL ON ad_campaigns TO service_role;
GRANT ALL ON ad_impressions TO service_role;

-- Comment
COMMENT ON TABLE ad_campaigns IS 'Tracks ad package purchases and campaigns';
COMMENT ON TABLE ad_impressions IS 'Tracks individual ad impressions and clicks';
COMMENT ON TABLE ad_packages IS 'Available ad packages (Foundation, Skyline, etc.)';
