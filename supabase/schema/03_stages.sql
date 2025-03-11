
-- Internship offers (stages) related tables
-- Created: 31/03/2025

-- Tags for categorizing stages
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stage-tags relationship
CREATE TABLE IF NOT EXISTS public.stage_tags (
    stage_id UUID REFERENCES stages(id),
    tag_id UUID REFERENCES tags(id),
    PRIMARY KEY (stage_id, tag_id)
);

-- Recommendations
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entreprise_id UUID REFERENCES entreprises(id),
    stagiaire_id UUID REFERENCES stagiaires(id),
    position VARCHAR(255),
    department VARCHAR(255),
    period VARCHAR(50),
    start_date DATE,
    end_date DATE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    skills TEXT[],
    achievements TEXT[],
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);
CREATE INDEX IF NOT EXISTS idx_stage_tags_tag ON stage_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_stagiaire ON recommendations(stagiaire_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_entreprise ON recommendations(entreprise_id);

-- Add comments
COMMENT ON TABLE tags IS 'Tags pour catégoriser les offres de stage';
COMMENT ON TABLE stage_tags IS 'Relation many-to-many entre offres de stage et tags';
COMMENT ON TABLE recommendations IS 'Recommandations données par les entreprises aux stagiaires';

