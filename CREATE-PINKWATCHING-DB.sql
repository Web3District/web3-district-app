-- Portugal Pride Pinkwashing Observatory Database
-- Run this in Supabase SQL Editor

-- Main reports table
CREATE TABLE IF NOT EXISTS pinkwashing_reports (
  id BIGSERIAL PRIMARY KEY,
  report_id TEXT UNIQUE NOT NULL,
  conversation_id TEXT,
  organization_name TEXT NOT NULL,
  description TEXT NOT NULL,
  location_date TEXT,
  evidence TEXT,
  pinkwashing_indicators TEXT,
  contact_preference TEXT,
  contact_value TEXT,
  anonymity_preference TEXT DEFAULT 'no',
  consent_given BOOLEAN DEFAULT false,
  user_email TEXT,
  status TEXT DEFAULT 'received',
  risk_level INTEGER, -- 0-4 scale from briefing
  ai_analysis JSONB,
  human_notes TEXT,
  organization_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  closed_at TIMESTAMPTZ,
  closed_reason TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_organization ON pinkwashing_reports(organization_name);
CREATE INDEX IF NOT EXISTS idx_reports_status ON pinkwashing_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_risk ON pinkwashing_reports(risk_level);
CREATE INDEX IF NOT EXISTS idx_reports_created ON pinkwashing_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_anonymity ON pinkwashing_reports(anonymity_preference);

-- Comments
COMMENT ON TABLE pinkwashing_reports IS 'Pinkwashing reports from Portugal Pride Observatory';
COMMENT ON COLUMN pinkwashing_reports.risk_level IS '0=none, 1=low, 2=moderate, 3=high, 4=critical';
COMMENT ON COLUMN pinkwashing_reports.status IS 'received, analyzing, human_review, contact_sent, resolved, archived';

-- Dashboard view: Recent reports
CREATE OR REPLACE VIEW dashboard_recent_reports AS
SELECT 
  report_id,
  organization_name,
  status,
  risk_level,
  anonymity_preference,
  created_at,
  CASE 
    WHEN risk_level >= 3 THEN 'high'
    WHEN risk_level = 2 THEN 'medium'
    ELSE 'low'
  END as priority
FROM pinkwashing_reports
ORDER BY created_at DESC
LIMIT 100;

-- Dashboard view: Statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  COUNT(*) as total_reports,
  COUNT(*) FILTER (WHERE status = 'received') as pending_review,
  COUNT(*) FILTER (WHERE status = 'contact_sent') as organizations_contacted,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
  COUNT(*) FILTER (WHERE risk_level >= 3) as high_risk,
  COUNT(*) FILTER (WHERE anonymity_preference = 'yes') as anonymous_reports,
  COUNT(DISTINCT organization_name) as unique_organizations,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_resolution_hours
FROM pinkwashing_reports;

-- Dashboard view: Organization history
CREATE OR REPLACE VIEW organization_report_history AS
SELECT 
  organization_name,
  COUNT(*) as total_reports,
  MAX(risk_level) as highest_risk,
  MAX(created_at) as last_reported,
  ARRAY_AGG(DISTINCT status) as statuses
FROM pinkwashing_reports
GROUP BY organization_name
ORDER BY total_reports DESC;

-- Row Level Security (RLS) - IMPORTANT FOR PRIVACY
ALTER TABLE pinkwashing_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admins can read
CREATE POLICY "Admins can view all reports"
  ON pinkwashing_reports
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Insert via API only (service role)
CREATE POLICY "Service role can insert"
  ON pinkwashing_reports
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Update by admins only
CREATE POLICY "Admins can update reports"
  ON pinkwashing_reports
  FOR UPDATE
  TO authenticated
  USING (true);

-- Email notifications table (optional)
CREATE TABLE IF NOT EXISTS report_notifications (
  id BIGSERIAL PRIMARY KEY,
  report_id TEXT REFERENCES pinkwashing_reports(report_id),
  notification_type TEXT, -- email, slack, webhook
  recipient TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' -- pending, sent, failed
);

-- Audit log for compliance
CREATE TABLE IF NOT EXISTS report_audit_log (
  id BIGSERIAL PRIMARY KEY,
  report_id TEXT REFERENCES pinkwashing_reports(report_id),
  action TEXT, -- created, viewed, updated, exported
  user_email TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details JSONB
);
