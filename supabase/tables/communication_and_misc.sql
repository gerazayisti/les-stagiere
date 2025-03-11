
-- Communication and Miscellaneous Tables
-- Created on 2025-05-15

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define message status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
        CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
    END IF;
END
$$;

-- Define notification type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('message', 'candidature', 'recommendation', 'stage');
    END IF;
END
$$;

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'non_lu',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidature_id UUID REFERENCES candidatures(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    last_message_at TIMESTAMP
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
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
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type notification_type,
    title VARCHAR(255),
    content TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Projects (Portfolio)
CREATE TABLE IF NOT EXISTS projects (
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
    status VARCHAR(50),
    highlights TEXT[],
    team_size INTEGER,
    role VARCHAR(255),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- User activities (analytics)
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(255),
    entity_type VARCHAR(255),
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Uploads
CREATE TABLE IF NOT EXISTS uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    mime_type VARCHAR(255),
    entity_type VARCHAR(50),
    entity_id UUID,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);

-- Enable Row Level Security on tables
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies

-- Contact messages policies
CREATE POLICY "Anyone can view contact messages" ON contact_messages
    FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Anyone can create contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT stagiaire_id FROM candidatures WHERE id = candidature_id
            UNION
            SELECT entreprise_id FROM stages WHERE id IN (
                SELECT stage_id FROM candidatures WHERE id = candidature_id
            )
        )
    );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = to_user_id
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Stagiaires can manage their projects" ON projects
    USING (auth.uid() = stagiaire_id)
    WITH CHECK (auth.uid() = stagiaire_id);

CREATE POLICY "Anyone can view projects" ON projects
    FOR SELECT USING (true);

-- Uploads policies
CREATE POLICY "Users can view their uploads or public uploads" ON uploads
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage their uploads" ON uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their uploads" ON uploads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their uploads" ON uploads
    FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE contact_messages IS 'Messages de contact envoyés par les utilisateurs et visiteurs';
COMMENT ON TABLE conversations IS 'Conversations entre stagiaires et entreprises';
COMMENT ON TABLE messages IS 'Messages échangés dans les conversations';
COMMENT ON TABLE notifications IS 'Notifications pour les utilisateurs';
COMMENT ON TABLE projects IS 'Projets dans le portfolio des stagiaires';
COMMENT ON TABLE user_activities IS 'Activités des utilisateurs pour l''analytique';
COMMENT ON TABLE uploads IS 'Fichiers uploadés par les utilisateurs';
