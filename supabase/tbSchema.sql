
-- Script de création des tables manquantes
-- Généré le 31/03/2025

-- Création de la table skills si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255),
    parent_id UUID REFERENCES skills(id),
    level INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Création de la table recommendations si elle n'existe pas
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

-- Création de la table stagiaire_skills si elle n'existe pas
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

-- Création de la table stage_tags si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.stage_tags (
    stage_id UUID REFERENCES stages(id),
    tag_id UUID REFERENCES tags(id),
    PRIMARY KEY (stage_id, tag_id)
);

-- Création de la table tags si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ajout des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_recommendations_stagiaire ON recommendations(stagiaire_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_entreprise ON recommendations(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_stagiaire_skills_skill ON stagiaire_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_stage_tags_tag ON stage_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);

-- Ajouter des RLS policies pour les nouvelles tables
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stagiaire_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Policies pour skills
CREATE POLICY "Anyone can view skills" ON skills
    FOR SELECT USING (true);
    
CREATE POLICY "Admin can manage skills" ON skills
    USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
    WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Policies pour recommendations
CREATE POLICY "Entreprises can create recommendations" ON recommendations
    FOR INSERT WITH CHECK (auth.uid() = entreprise_id);

CREATE POLICY "Entreprises can update their recommendations" ON recommendations
    FOR UPDATE USING (auth.uid() = entreprise_id);

CREATE POLICY "Anyone can view public recommendations" ON recommendations
    FOR SELECT USING (is_public = true OR auth.uid() = entreprise_id OR auth.uid() = stagiaire_id);

-- Policies pour stagiaire_skills
CREATE POLICY "Stagiaires can manage their skills" ON stagiaire_skills
    USING (auth.uid() = stagiaire_id)
    WITH CHECK (auth.uid() = stagiaire_id);

CREATE POLICY "Anyone can view stagiaire skills" ON stagiaire_skills
    FOR SELECT USING (true);

-- Policies pour tags et stage_tags
CREATE POLICY "Anyone can view tags" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage tags" ON tags
    USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
    WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Anyone can view stage_tags" ON stage_tags
    FOR SELECT USING (true);

CREATE POLICY "Entreprises can manage stage_tags for their stages" ON stage_tags
    USING (auth.uid() IN (SELECT entreprise_id FROM stages WHERE id = stage_id))
    WITH CHECK (auth.uid() IN (SELECT entreprise_id FROM stages WHERE id = stage_id));

-- Commentaires sur les tables
COMMENT ON TABLE skills IS 'Taxonomie des compétences pour les stagiaires et les offres de stage';
COMMENT ON TABLE recommendations IS 'Recommandations données par les entreprises aux stagiaires';
COMMENT ON TABLE stagiaire_skills IS 'Relation many-to-many entre stagiaires et compétences avec niveau';
COMMENT ON TABLE tags IS 'Tags pour catégoriser les offres de stage';
COMMENT ON TABLE stage_tags IS 'Relation many-to-many entre offres de stage et tags';
