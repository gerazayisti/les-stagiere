
-- Run this script last to perform any final operations
-- Created: 31/03/2025

-- Execute the function to create all indexes
SELECT create_indexes();

-- Add a comment about the schema organization
COMMENT ON SCHEMA public IS 'Platform schema organized by functional areas';

