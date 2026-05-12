-- Building Events Tracking Table (for ALL buildings - landmarks + user claimed)
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS building_events (
  id BIGSERIAL PRIMARY KEY,
  building_login TEXT NOT NULL, -- GitHub username/repo (e.g., "eddiezebra/my-repo")
  building_slug TEXT, -- For landmarks
  event_type TEXT NOT NULL, -- impression, click, card_viewed, visit, share_x, share_telegram, share_linkedin, copy_link
  user_github_login TEXT, -- Who performed the action
  user_developer_id INTEGER,
  session_id TEXT,
  url TEXT, -- For shares
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_building_events_login ON building_events(building_login);
CREATE INDEX IF NOT EXISTS idx_building_events_slug ON building_events(building_slug);
CREATE INDEX IF NOT EXISTS idx_building_events_type ON building_events(event_type);
CREATE INDEX IF NOT EXISTS idx_building_events_user ON building_events(user_github_login);
CREATE INDEX IF NOT EXISTS idx_building_events_created ON building_events(created_at);

-- Add comments
COMMENT ON TABLE building_events IS 'Tracks ALL building interactions: landmarks and user-claimed buildings';
COMMENT ON COLUMN building_events.building_login IS 'GitHub username/repo for user buildings (e.g., "eddiezebra/my-repo")';
COMMENT ON COLUMN building_events.building_slug IS 'Landmark slug for sponsored landmarks';
COMMENT ON COLUMN building_events.event_type IS 'impression, click, card_viewed, visit, share_x, share_telegram, share_linkedin, copy_link';

-- Create view for building analytics summary
CREATE OR REPLACE VIEW building_analytics_summary AS
SELECT 
  COALESCE(building_login, building_slug) as building_identifier,
  building_login,
  building_slug,
  COUNT(*) FILTER (WHERE event_type = 'impression') as total_impressions,
  COUNT(*) FILTER (WHERE event_type = 'click') as total_clicks,
  COUNT(*) FILTER (WHERE event_type = 'card_viewed') as total_card_views,
  COUNT(*) FILTER (WHERE event_type = 'visit') as total_visits,
  COUNT(*) FILTER (WHERE event_type LIKE 'share_%') as total_shares,
  COUNT(*) FILTER (WHERE event_type = 'share_x') as shares_x,
  COUNT(*) FILTER (WHERE event_type = 'share_telegram') as shares_telegram,
  COUNT(*) FILTER (WHERE event_type = 'share_linkedin') as shares_linkedin,
  COUNT(*) FILTER (WHERE event_type = 'copy_link') as link_copies,
  COUNT(DISTINCT user_github_login) as unique_users,
  MAX(created_at) as last_activity
FROM building_events
GROUP BY building_login, building_slug
ORDER BY total_clicks DESC;

-- Create view for user building activity (who shared/visited what)
CREATE OR REPLACE VIEW building_user_activity AS
SELECT 
  user_github_login,
  COALESCE(building_login, building_slug) as building_identifier,
  building_login,
  building_slug,
  event_type,
  url,
  created_at
FROM building_events
WHERE user_github_login IS NOT NULL
  AND (event_type LIKE 'share_%' OR event_type = 'visit' OR event_type = 'copy_link')
ORDER BY created_at DESC;

-- Create view for top buildings by engagement
CREATE OR REPLACE VIEW top_buildings_by_engagement AS
SELECT 
  COALESCE(building_login, building_slug) as building_identifier,
  building_login,
  building_slug,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE event_type = 'click') as clicks,
  COUNT(*) FILTER (WHERE event_type = 'visit') as visits,
  COUNT(*) FILTER (WHERE event_type LIKE 'share_%') as shares,
  COUNT(DISTINCT user_github_login) as unique_visitors,
  -- Engagement score: clicks*1 + visits*2 + shares*5
  (COUNT(*) FILTER (WHERE event_type = 'click') * 1 + 
   COUNT(*) FILTER (WHERE event_type = 'visit') * 2 + 
   COUNT(*) FILTER (WHERE event_type LIKE 'share_%') * 5) as engagement_score
FROM building_events
GROUP BY building_login, building_slug
HAVING COUNT(*) > 0
ORDER BY engagement_score DESC
LIMIT 100;
