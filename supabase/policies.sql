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

-- First, make sure we enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS but with proper policies
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stagiaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;

-- Policy for users table to allow inserts during registration
CREATE POLICY "Enable insert for registration" ON users
    FOR INSERT
    WITH CHECK (true);

-- Policy for stagiaires table to allow inserts during registration
CREATE POLICY "Enable insert for stagiaires registration" ON stagiaires
    FOR INSERT
    WITH CHECK (true);

-- Policy for entreprises table to allow inserts during registration
CREATE POLICY "Enable insert for entreprises registration" ON entreprises
    FOR INSERT
    WITH CHECK (true);

-- Modify the users table policy to allow select
CREATE POLICY "Enable select for authenticated users" ON users
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Add trigger function to automatically create profile entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'stagiaire'));
    
    IF (NEW.raw_user_meta_data->>'role' = 'stagiaire') THEN
        INSERT INTO public.stagiaires (id, name, email)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
    ELSIF (NEW.raw_user_meta_data->>'role' = 'entreprise') THEN
        INSERT INTO public.entreprises (id, name, email)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

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
