
-- Users and Profiles Tables
-- Created on 2025-05-15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define user roles enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('stagiaire', 'entreprise', 'admin');
    END IF;
END
$$;

-- Table utilisateurs qui étend auth.users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Stagiaires profile
CREATE TABLE IF NOT EXISTS stagiaires (
    id UUID PRIMARY KEY REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    avatar_url TEXT,
    location VARCHAR(255),
    bio TEXT,
    phone VARCHAR(50),
    education TEXT[],
    disponibility VARCHAR(50),
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    skills TEXT[],
    languages TEXT[],
    social_links JSONB,
    is_verified BOOLEAN DEFAULT false,
    experience_years INTEGER DEFAULT 0,
    preferred_locations TEXT[],
    preferred_domains TEXT[],
    is_premium BOOLEAN DEFAULT false,
    visibility_settings JSONB,
    search_status VARCHAR(50),
    last_active TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Entreprises profile
CREATE TABLE IF NOT EXISTS entreprises (
    id UUID PRIMARY KEY REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    industry VARCHAR(255),
    location VARCHAR(255),
    website TEXT,
    phone VARCHAR(50),
    size VARCHAR(50),
    founded_year INTEGER,
    social_media JSONB,
    company_culture TEXT,
    benefits TEXT[],
    is_premium BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2),
    number_of_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Skills taxonomy
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255),
    parent_id UUID REFERENCES skills(id),
    level INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stagiaire skills relation (many-to-many with level)
CREATE TABLE IF NOT EXISTS stagiaire_skills (
    stagiaire_id UUID REFERENCES stagiaires(id),
    skill_id UUID REFERENCES skills(id),
    level INTEGER CHECK (level BETWEEN 1 AND 5),
    years_experience DECIMAL(4,1),
    is_highlighted BOOLEAN DEFAULT false,
    last_used_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (stagiaire_id, skill_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_stagiaire_skills_skill ON stagiaire_skills(skill_id);

-- Enable Row Level Security on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stagiaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE stagiaire_skills ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies
-- Users policies
CREATE POLICY "Enable insert for registration" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for own user" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Enable update for own user" ON users FOR UPDATE USING (auth.uid() = id);

-- Stagiaires policies
CREATE POLICY "Enable insert for stagiaires" ON stagiaires FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for stagiaires" ON stagiaires FOR SELECT USING (true);
CREATE POLICY "Enable update for own stagiaire" ON stagiaires FOR UPDATE USING (auth.uid() = id);

-- Entreprises policies
CREATE POLICY "Enable insert for entreprises" ON entreprises FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for entreprises" ON entreprises FOR SELECT USING (true);
CREATE POLICY "Enable update for own entreprise" ON entreprises FOR UPDATE USING (auth.uid() = id);

-- Skills policies
CREATE POLICY "Anyone can view skills" ON skills
    FOR SELECT USING (true);
    
CREATE POLICY "Admin can manage skills" ON skills
    USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
    WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Stagiaire skills policies
CREATE POLICY "Stagiaires can manage their skills" ON stagiaire_skills
    USING (auth.uid() = stagiaire_id)
    WITH CHECK (auth.uid() = stagiaire_id);

CREATE POLICY "Anyone can view stagiaire skills" ON stagiaire_skills
    FOR SELECT USING (true);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Table centrale pour l''authentification et les informations de base des utilisateurs';
COMMENT ON TABLE stagiaires IS 'Profils détaillés des stagiaires';
COMMENT ON TABLE entreprises IS 'Profils détaillés des entreprises';
COMMENT ON TABLE skills IS 'Taxonomie des compétences pour les stagiaires et les offres de stage';
COMMENT ON TABLE stagiaire_skills IS 'Relation many-to-many entre stagiaires et compétences avec niveau';
