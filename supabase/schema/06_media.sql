
-- Media and uploads related tables
-- Created: 31/03/2025

-- Uploads table for all media files
CREATE TABLE IF NOT EXISTS public.uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(512) NOT NULL,
    filesize INTEGER NOT NULL,
    filetype VARCHAR(100) NOT NULL,
    metadata JSONB,
    usage_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_usage ON uploads(usage_type);

-- Add comments
COMMENT ON TABLE uploads IS 'Fichiers téléchargés par les utilisateurs';

