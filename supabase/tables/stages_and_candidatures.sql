
-- Stages (Internships) and Candidatures Tables
-- Created on 2025-05-15

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define stage type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stage_type') THEN
        CREATE TYPE stage_type AS ENUM ('temps_plein', 'temps_partiel', 'alternance', 'remote');
    END IF;
END
$$;

-- Define candidature status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candidature_status') THEN
        CREATE TYPE candidature_status AS ENUM ('en_attente', 'acceptee', 'refusee', 'en_discussion');
    END IF;
END
$$;

-- Documents (CVs, cover letters, etc.)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stagiaire_id UUID REFERENCES stagiaires(id),
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    upload_date TIMESTAMP DEFAULT NOW(),
    last_modified TIMESTAMP,
    metadata JSONB
);

-- Stages (Internship offers)
CREATE TABLE IF NOT EXISTS stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entreprise_id UUID REFERENCES entreprises(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    requirements TEXT,
    responsibilities TEXT,
    location VARCHAR(255),
    remote_policy VARCHAR(50),
    type stage_type,
    duration VARCHAR(50),
    start_date DATE,
    compensation JSONB,
    required_skills TEXT[],
    preferred_skills TEXT[],
    education_level VARCHAR(255),
    status VARCHAR(50),
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    deadline TIMESTAMP,
    is_featured BOOLEAN DEFAULT false,
    is_urgent BOOLEAN DEFAULT false,
    search_vector tsvector
);

-- Tags for categorizing internship offers
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Many-to-many relationship between stages and tags
CREATE TABLE IF NOT EXISTS stage_tags (
    stage_id UUID REFERENCES stages(id),
    tag_id UUID REFERENCES tags(id),
    PRIMARY KEY (stage_id, tag_id)
);

-- Candidatures (Applications)
CREATE TABLE IF NOT EXISTS candidatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID REFERENCES stages(id),
    stagiaire_id UUID REFERENCES stagiaires(id),
    cv_id UUID REFERENCES documents(id),
    lettre_motivation_id UUID REFERENCES documents(id),
    status candidature_status DEFAULT 'en_attente',
    note TEXT,
    internal_rating INTEGER,
    interview_date TIMESTAMP,
    interview_feedback TEXT,
    date_postulation TIMESTAMP DEFAULT NOW(),
    last_interaction TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(stage_id, stagiaire_id)
);

-- Recommendations for stagiaires from entreprises
CREATE TABLE IF NOT EXISTS recommendations (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stages_entreprise ON stages(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_stages_status ON stages(status);
CREATE INDEX IF NOT EXISTS idx_candidatures_stage ON candidatures(stage_id);
CREATE INDEX IF NOT EXISTS idx_candidatures_stagiaire ON candidatures(stagiaire_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_stagiaire ON recommendations(stagiaire_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_entreprise ON recommendations(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);
CREATE INDEX IF NOT EXISTS idx_stage_tags_tag ON stage_tags(tag_id);
CREATE INDEX IF NOT EXISTS stages_search_idx ON stages USING gin(search_vector);

-- Enable Row Level Security on tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies

-- Documents policies
CREATE POLICY "Enable insert for documents" ON documents FOR INSERT WITH CHECK (auth.uid() = stagiaire_id);
CREATE POLICY "Enable select for own documents" ON documents FOR SELECT USING (auth.uid() = stagiaire_id OR is_public = true);
CREATE POLICY "Enable update for own documents" ON documents FOR UPDATE USING (auth.uid() = stagiaire_id);
CREATE POLICY "Enable delete for own documents" ON documents FOR DELETE USING (auth.uid() = stagiaire_id);

-- Stages policies (add more as needed)
CREATE POLICY "Enable insert for entreprises" ON stages 
    FOR INSERT WITH CHECK (auth.uid() = entreprise_id);
CREATE POLICY "Enable select for all" ON stages 
    FOR SELECT USING (true);
CREATE POLICY "Enable update for own stages" ON stages 
    FOR UPDATE USING (auth.uid() = entreprise_id);
CREATE POLICY "Enable delete for own stages" ON stages 
    FOR DELETE USING (auth.uid() = entreprise_id);

-- Tags policies
CREATE POLICY "Anyone can view tags" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage tags" ON tags
    USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
    WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Stage tags policies
CREATE POLICY "Anyone can view stage_tags" ON stage_tags
    FOR SELECT USING (true);

CREATE POLICY "Entreprises can manage stage_tags for their stages" ON stage_tags
    USING (auth.uid() IN (SELECT entreprise_id FROM stages WHERE id = stage_id))
    WITH CHECK (auth.uid() IN (SELECT entreprise_id FROM stages WHERE id = stage_id));

-- Candidatures policies
CREATE POLICY "Stagiaires can create candidatures" ON candidatures
    FOR INSERT WITH CHECK (auth.uid() = stagiaire_id);

CREATE POLICY "Stagiaires can view their candidatures" ON candidatures
    FOR SELECT USING (auth.uid() = stagiaire_id OR auth.uid() IN (
        SELECT entreprise_id FROM stages WHERE id = stage_id
    ));

-- Recommendations policies
CREATE POLICY "Entreprises can create recommendations" ON recommendations
    FOR INSERT WITH CHECK (auth.uid() = entreprise_id);

CREATE POLICY "Entreprises can update their recommendations" ON recommendations
    FOR UPDATE USING (auth.uid() = entreprise_id);

CREATE POLICY "Anyone can view public recommendations" ON recommendations
    FOR SELECT USING (is_public = true OR auth.uid() = entreprise_id OR auth.uid() = stagiaire_id);

-- Add comments for documentation
COMMENT ON TABLE documents IS 'Documents des stagiaires (CV, lettres de motivation, etc.)';
COMMENT ON TABLE stages IS 'Offres de stages publiées par les entreprises';
COMMENT ON TABLE tags IS 'Tags pour catégoriser les offres de stage';
COMMENT ON TABLE stage_tags IS 'Relation many-to-many entre offres de stage et tags';
COMMENT ON TABLE candidatures IS 'Candidatures des stagiaires aux offres de stages';
COMMENT ON TABLE recommendations IS 'Recommandations données par les entreprises aux stagiaires';
