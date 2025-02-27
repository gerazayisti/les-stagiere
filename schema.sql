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

-- CVs and Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stagiaire_id UUID REFERENCES stagiaires(id),
    type VARCHAR(50) NOT NULL, -- 'cv', 'lettre_motivation', 'portfolio', 'certification'
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
    compensation JSONB, -- {amount: number, currency: string, period: string}
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
    is_urgent BOOLEAN DEFAULT false
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

-- Recommendations
CREATE TABLE recommendations (
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

-- Projects (Portfolio)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stagiaire_id UUID REFERENCES stagiaires(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    domain VARCHAR(255),
    technologies TEXT[],
    image_url TEXT,
    gallery_urls TEXT[],
    project_url TEXT,
    github_url TEXT,
    start_date DATE,
    end_date DATE,
    status project_status,
    highlights TEXT[],
    team_size INTEGER,
    role VARCHAR(255),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    plan_type subscription_type,
    plan_name VARCHAR(255),
    status VARCHAR(50),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    trial_end_date TIMESTAMP,
    price DECIMAL(10,2),
    currency VARCHAR(3),
    billing_cycle VARCHAR(50),
    payment_status VARCHAR(50),
    payment_method JSONB,
    features JSONB,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Messages
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidature_id UUID REFERENCES candidatures(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    last_message_at TIMESTAMP
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id),
    sender_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id) NOT NULL,
    content TEXT,
    attachments JSONB,
    status message_status DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type notification_type,
    title VARCHAR(255),
    content TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Skills taxonomy
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255),
    parent_id UUID REFERENCES skills(id),
    level INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tags for stages
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stage_tags (
    stage_id UUID REFERENCES stages(id),
    tag_id UUID REFERENCES tags(id),
    PRIMARY KEY (stage_id, tag_id)
);

-- Analytics
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(255),
    entity_type VARCHAR(255),
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Formations et certifications
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stagiaire_id UUID REFERENCES stagiaires(id),
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(255),
    credential_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Expériences professionnelles
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stagiaire_id UUID REFERENCES stagiaires(id),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    location VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    skills_used TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Articles et blog posts
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    summary TEXT,
    cover_image TEXT,
    status VARCHAR(50),
    published_at TIMESTAMP,
    tags TEXT[],
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Commentaires
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    article_id UUID REFERENCES articles(id),
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id),
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Événements (webinaires, ateliers, etc.)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    location VARCHAR(255),
    is_online BOOLEAN DEFAULT false,
    meeting_url TEXT,
    max_participants INTEGER,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Inscriptions aux événements
CREATE TABLE event_registrations (
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    status VARCHAR(50),
    registration_date TIMESTAMP DEFAULT NOW(),
    attended BOOLEAN DEFAULT false,
    feedback TEXT,
    PRIMARY KEY (event_id, user_id)
);

-- Compétences des stagiaires (relation many-to-many avec niveau)
CREATE TABLE stagiaire_skills (
    stagiaire_id UUID REFERENCES stagiaires(id),
    skill_id UUID REFERENCES skills(id),
    level INTEGER CHECK (level BETWEEN 1 AND 5),
    years_experience DECIMAL(4,1),
    is_highlighted BOOLEAN DEFAULT false,
    last_used_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (stagiaire_id, skill_id)
);

-- Favoris
CREATE TABLE favorites (
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(50), -- 'stage', 'stagiaire', 'entreprise', 'article'
    entity_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, entity_type, entity_id)
);

-- Messages de contact
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP,
    responded_by UUID REFERENCES users(id)
);

-- Réinitialisation de mot de passe
CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vérification d'email
CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Rapports et signalements
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id),
    reported_id UUID REFERENCES users(id),
    entity_type VARCHAR(50), -- 'user', 'stage', 'message', 'comment'
    entity_id UUID,
    reason VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id)
);

-- Paramètres utilisateur
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    notification_preferences JSONB,
    privacy_settings JSONB,
    theme_preferences JSONB,
    language VARCHAR(10) DEFAULT 'fr',
    timezone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Historique des connexions
CREATE TABLE login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    location JSONB,
    success BOOLEAN,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fichiers uploadés
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    mime_type VARCHAR(255),
    entity_type VARCHAR(50), -- 'avatar', 'cv', 'logo', 'gallery'
    entity_id UUID,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Newsletter
CREATE TABLE newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    subscription_date TIMESTAMP DEFAULT NOW(),
    unsubscribed_date TIMESTAMP,
    categories TEXT[]
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_stages_entreprise ON stages(entreprise_id);
CREATE INDEX idx_stages_status ON stages(status);
CREATE INDEX idx_candidatures_stage ON candidatures(stage_id);
CREATE INDEX idx_candidatures_stagiaire ON candidatures(stagiaire_id);
CREATE INDEX idx_recommendations_stagiaire ON recommendations(stagiaire_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_user_activities_user ON user_activities(user_id);
CREATE INDEX idx_certifications_stagiaire ON certifications(stagiaire_id);
CREATE INDEX idx_experiences_stagiaire ON experiences(stagiaire_id);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_stagiaire_skills_skill ON stagiaire_skills(skill_id);
CREATE INDEX idx_favorites_entity ON favorites(entity_type, entity_id);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_uploads_user ON uploads(user_id);
CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);

-- Full Text Search
ALTER TABLE stages ADD COLUMN search_vector tsvector;
CREATE INDEX stages_search_idx ON stages USING gin(search_vector);

CREATE OR REPLACE FUNCTION stages_search_trigger() RETURNS trigger AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('french', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('french', coalesce(new.short_description,'')), 'B') ||
    setweight(to_tsvector('french', coalesce(new.description,'')), 'C');
  return new;
end
$$ LANGUAGE plpgsql;

CREATE TRIGGER stages_search_update
  BEFORE INSERT OR UPDATE
  ON stages
  FOR EACH ROW
  EXECUTE FUNCTION stages_search_trigger();

-- Permissions
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stagiaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE users IS 'Table centrale pour l''authentification et les informations de base des utilisateurs';
COMMENT ON TABLE stagiaires IS 'Profils détaillés des stagiaires';
COMMENT ON TABLE entreprises IS 'Profils détaillés des entreprises';
COMMENT ON TABLE stages IS 'Offres de stages publiées par les entreprises';
COMMENT ON TABLE candidatures IS 'Candidatures des stagiaires aux offres de stages';
COMMENT ON TABLE recommendations IS 'Recommandations données par les entreprises aux stagiaires';
COMMENT ON TABLE projects IS 'Projets dans le portfolio des stagiaires';
COMMENT ON TABLE subscriptions IS 'Abonnements premium des utilisateurs';
COMMENT ON TABLE messages IS 'Système de messagerie entre stagiaires et entreprises';
COMMENT ON TABLE notifications IS 'Notifications système pour les utilisateurs';
