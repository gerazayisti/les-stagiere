
-- Stagiaires (interns) related tables
-- Created: 31/03/2025

-- Skills taxonomy
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255),
    parent_id UUID REFERENCES skills(id),
    level INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stagiaire-skills relationship
CREATE TABLE IF NOT EXISTS public.stagiaire_skills (
    stagiaire_id UUID REFERENCES stagiaires(id),
    skill_id UUID REFERENCES skills(id),
    level INTEGER CHECK (level BETWEEN 1 AND 5),
    years_experience DECIMAL(4,1),
    is_highlighted BOOLEAN DEFAULT false,
    last_used_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (stagiaire_id, skill_id)
);

-- Certifications
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stagiaire_id UUID REFERENCES stagiaires(id),
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(255),
    url VARCHAR(512),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Experiences
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stagiaire_id UUID REFERENCES stagiaires(id),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_stagiaire_skills_skill ON stagiaire_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_certifications_stagiaire ON certifications(stagiaire_id);
CREATE INDEX IF NOT EXISTS idx_experiences_stagiaire ON experiences(stagiaire_id);

-- Add comments
COMMENT ON TABLE skills IS 'Taxonomie des compétences pour les stagiaires et les offres de stage';
COMMENT ON TABLE stagiaire_skills IS 'Relation many-to-many entre stagiaires et compétences avec niveau';
COMMENT ON TABLE certifications IS 'Certifications obtenues par les stagiaires';
COMMENT ON TABLE experiences IS 'Expériences professionnelles des stagiaires';

