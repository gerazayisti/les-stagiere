
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create common indexes
CREATE OR REPLACE FUNCTION create_indexes() 
RETURNS void AS $$
BEGIN
    -- This function will be called after all tables are created
    -- to ensure proper index creation
    RAISE NOTICE 'Creating indexes for all tables';
END;
$$ LANGUAGE plpgsql;

