
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

-- Création de la table tags si elle n'existe pas (déplacée avant stage_tags)
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Création de la table stage_tags si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.stage_tags (
    stage_id UUID REFERENCES stages(id),
    tag_id UUID REFERENCES tags(id),
    PRIMARY KEY (stage_id, tag_id)
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

-- Création de la table user_activities si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Création de la table certifications si elle n'existe pas
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

-- Création de la table experiences si elle n'existe pas
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

-- Création de la table articles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    excerpt VARCHAR(512),
    status VARCHAR(20) DEFAULT 'draft',
    featured_image VARCHAR(512),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Création de la table comments si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    article_id UUID REFERENCES articles(id),
    parent_id UUID REFERENCES comments(id),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'published',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Création de la table events si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(512),
    is_online BOOLEAN DEFAULT false,
    max_participants INTEGER,
    status VARCHAR(20) DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Création de la table event_registrations si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'registered',
    registration_time TIMESTAMP DEFAULT NOW()
);

-- Création de la table favorites si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Création de la table password_resets si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Création de la table email_verifications si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Création de la table reports si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id),
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Création de la table user_settings si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    email_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    application_updates BOOLEAN DEFAULT true,
    dark_mode BOOLEAN DEFAULT false,
    language VARCHAR(10) DEFAULT 'fr',
    timezone VARCHAR(50) DEFAULT 'Europe/Paris',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Création de la table login_history si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    ip_address VARCHAR(50),
    user_agent TEXT,
    device VARCHAR(255),
    location VARCHAR(255),
    success BOOLEAN DEFAULT true,
    login_time TIMESTAMP DEFAULT NOW()
);

-- Création de la table uploads si elle n'existe pas
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

-- Création de la table newsletter_subscriptions si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    subscription_date TIMESTAMP DEFAULT NOW(),
    unsubscribed_at TIMESTAMP
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
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_certifications_stagiaire ON certifications(stagiaire_id);
CREATE INDEX IF NOT EXISTS idx_experiences_stagiaire ON experiences(stagiaire_id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_content ON favorites(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_content ON reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_usage ON uploads(usage_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscriptions(status);

-- Commentaires sur les tables
COMMENT ON TABLE skills IS 'Taxonomie des compétences pour les stagiaires et les offres de stage';
COMMENT ON TABLE recommendations IS 'Recommandations données par les entreprises aux stagiaires';
COMMENT ON TABLE stagiaire_skills IS 'Relation many-to-many entre stagiaires et compétences avec niveau';
COMMENT ON TABLE tags IS 'Tags pour catégoriser les offres de stage';
COMMENT ON TABLE stage_tags IS 'Relation many-to-many entre offres de stage et tags';
COMMENT ON TABLE user_activities IS 'Journal des activités des utilisateurs sur la plateforme';
COMMENT ON TABLE certifications IS 'Certifications obtenues par les stagiaires';
COMMENT ON TABLE experiences IS 'Expériences professionnelles des stagiaires';
COMMENT ON TABLE articles IS 'Articles du blog de la plateforme';
COMMENT ON TABLE comments IS 'Commentaires sur les articles du blog';
COMMENT ON TABLE events IS 'Événements organisés sur la plateforme';
COMMENT ON TABLE event_registrations IS 'Inscriptions aux événements';
COMMENT ON TABLE favorites IS 'Contenu favori des utilisateurs';
COMMENT ON TABLE password_resets IS 'Jetons pour la réinitialisation des mots de passe';
COMMENT ON TABLE email_verifications IS 'Jetons pour la vérification des adresses email';
COMMENT ON TABLE reports IS 'Signalements de contenu inapproprié';
COMMENT ON TABLE user_settings IS 'Préférences utilisateur';
COMMENT ON TABLE login_history IS 'Historique des connexions des utilisateurs';
COMMENT ON TABLE uploads IS 'Fichiers téléchargés par les utilisateurs';
COMMENT ON TABLE newsletter_subscriptions IS 'Abonnements à la newsletter';
