-- Create view for environmental diagnostics with creator information
-- This view joins environmental_diagnostics with user_profiles_with_email
-- to include creator's name and email in a single query

CREATE OR REPLACE VIEW environmental_diagnostics_with_creator AS
SELECT 
  ed.*,
  up.full_name as creator_name,
  up.user_email as creator_email
FROM environmental_diagnostics ed
LEFT JOIN user_profiles_with_email up ON ed.user_id = up.user_id;

-- Grant access to authenticated users
GRANT SELECT ON environmental_diagnostics_with_creator TO authenticated;

-- Enable RLS (Row Level Security)
ALTER VIEW environmental_diagnostics_with_creator SET (security_invoker = true);

-- Note: RLS policies from environmental_diagnostics table will apply automatically
-- since this view is based on that table and uses security_invoker = true
