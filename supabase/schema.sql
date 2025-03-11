
-- Master schema file that includes all other schema files
-- This file should be run to create the complete database schema
-- Created: 31/03/2025

-- Include all schema files in the correct order
\i schema/00_extensions.sql
\i schema/01_users.sql
\i schema/02_stagiaires.sql
\i schema/03_stages.sql
\i schema/04_content.sql
\i schema/05_interaction.sql
\i schema/06_media.sql
\i schema/99_finalize.sql

