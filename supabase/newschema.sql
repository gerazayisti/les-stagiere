
-- Schema pour Les Stagiaires
-- Généré le 26/02/2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('stagiaire', 'entreprise', 'admin');
CREATE TYPE candidature_status AS ENUM ('en_attente', 'acceptee', 'refusee', 'en_discussion');
CREATE TYPE project_status AS ENUM ('completed', 'in_progress', 'planned');
CREATE TYPE subscription_type AS ENUM ('stagiaire', 'entreprise');
CREATE TYPE stage_type AS ENUM ('temps_plein', 'temps_partiel', 'alternance', 'remote');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE notification_type AS ENUM ('message', 'candidature', 'recommendation', 'stage');

-- Base user table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Stagiaires profile
CREATE TABLE stagiaires (
    id UUID PRIMARY KEY REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    avatar_url TEXT,
    location VARCHAR(255),
    bio TEXT,
    phone VARCHAR(50),
    education TEXT,
    disponibility VARCHAR(50),
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    skills TEXT[],
    languages TEXT[],
    experience_years INTEGER DEFAULT 0,
    preferred_locations TEXT[],
    preferred_domains TEXT[],
    is_premium BOOLEAN DEFAULT false,
    visibility_settings JSONB,
    search_status VARCHAR(50),
    last_active TIMESTAMP
);

-- Entreprises profile
CREATE TABLE entreprises (
    id UUID PRIMARY KEY REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
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
    verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2),
    number_of_reviews INTEGER DEFAULT 0
);

-- Stages (Internship offers)
CREATE TABLE stages (
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

-- Candidatures (Applications)
CREATE TABLE candidatures (
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

-- Contact messages
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'non_lu',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_stages_entreprise ON stages(entreprise_id);
CREATE INDEX idx_stages_status ON stages(status);
CREATE INDEX idx_candidatures_stage ON candidatures(stage_id);
CREATE INDEX idx_candidatures_stagiaire ON candidatures(stagiaire_id);
CREATE INDEX stages_search_idx ON stages USING gin(search_vector);
