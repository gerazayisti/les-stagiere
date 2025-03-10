
-- Politiques de sécurité RLS pour Supabase

-- IMPORTANT: Désactivation complète des politiques RLS pour permettre l'inscription
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE stagiaires DISABLE ROW LEVEL SECURITY;
ALTER TABLE entreprises DISABLE ROW LEVEL SECURITY;
ALTER TABLE stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidatures DISABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE stagiaire_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications DISABLE ROW LEVEL SECURITY;

-- Politique pour la table users (notre table publique)
-- Ces politiques seront réactivées plus tard quand l'inscription fonctionnera
CREATE OR REPLACE POLICY "Enable all operations for all users" ON users
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- Politique pour la table stagiaires
CREATE OR REPLACE POLICY "Enable all operations for stagiaires" ON stagiaires
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- Politique pour la table entreprises
CREATE OR REPLACE POLICY "Enable all operations for entreprises" ON entreprises
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- Politique pour la table contact_messages
CREATE OR REPLACE POLICY "Anyone can view contact messages" ON contact_messages
    FOR SELECT 
    USING (true);

CREATE OR REPLACE POLICY "Anyone can create contact messages" ON contact_messages
    FOR INSERT 
    WITH CHECK (true);
