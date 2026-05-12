-- Landmark Events Tracking Table
-- Run this in Supabase SQL Editor to track all landmark interactions

CREATE TABLE IF NOT EXISTS landmark_events (
  id BIGSERIAL PRIMARY KEY,
  landmark_slug TEXT NOT NULL,
  event_type TEXT NOT NULL, -- impression, click, card_viewed, cta_clicked, share_x, share_telegram, share_linkedin
  user_github_login TEXT,
  user_developer_id INTEGER,
  session_id TEXT,
  url TEXT, -- For CTA clicks and shares
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landmark_events_slug ON landmark_events(landmark_slug);
CREATE INDEX IF NOT EXISTS idx_landmark_events_type ON landmark_events(event_type);
CREATE INDEX IF NOT EXISTS idx_landmark_events_user ON landmark_events(user_github_login);
CREATE INDEX IF NOT EXISTS idx_landmark_events_created ON landmark_events(created_at);

-- Add comments
COMMENT ON TABLE landmark_events IS 'Tracks all landmark interactions: impressions, clicks, shares, CTA clicks';
COMMENT ON COLUMN landmark_events.event_type IS 'impression=visible, click=user clicked building, card_viewed=info card opened, cta_clicked=CTA button clicked, share_x=shared on X, share_telegram, share_linkedin';

-- Create view for landmark analytics summary
CREATE OR REPLACE VIEW landmark_analytics_summary AS
SELECT 
  landmark_slug,
  COUNT(*) FILTER (WHERE event_type = 'impression') as total_impressions,
  COUNT(*) FILTER (WHERE event_type = 'click') as total_clicks,
  COUNT(*) FILTER (WHERE event_type = 'card_viewed') as total_card_views,
  COUNT(*) FILTER (WHERE event_type = 'cta_clicked') as total_cta_clicks,
  COUNT(*) FILTER (WHERE event_type LIKE 'share_%') as total_shares,
  COUNT(*) FILTER (WHERE event_type = 'share_x') as shares_x,
  COUNT(*) FILTER (WHERE event_type = 'share_telegram') as shares_telegram,
  COUNT(*) FILTER (WHERE event_type = 'share_linkedin') as shares_linkedin,
  COUNT(DISTINCT user_github_login) as unique_users,
  MAX(created_at) as last_activity
FROM landmark_events
GROUP BY landmark_slug
ORDER BY total_clicks DESC;

-- Create view for user activity (who shared what)
CREATE OR REPLACE VIEW landmark_user_activity AS
SELECT 
  user_github_login,
  landmark_slug,
  event_type,
  url,
  created_at
FROM landmark_events
WHERE user_github_login IS NOT NULL
  AND (event_type LIKE 'share_%' OR event_type = 'cta_clicked')
ORDER BY created_at DESC;
