-- Delete the two test ads that can't be removed from admin
-- Run in: https://supabase.com/dashboard/project/rhppbqsuktyunxfwnddp/sql/new

DELETE FROM ads WHERE id IN ('gitcity', 'samuel');

-- Verify deletion
SELECT id, brand, campaign, type, active FROM ads ORDER BY priority DESC;
