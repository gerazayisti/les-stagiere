
-- Politiques de sécurité RLS pour Supabase

-- IMPORTANT: Désactivation temporaire des politiques RLS pour déboguer l'inscription
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

-- Politique pour la table users (notre table publique)
-- Ces politiques seront réactivées plus tard quand l'inscription fonctionnera
CREATE OR REPLACE POLICY "Enable insert for all users" ON users
    FOR INSERT 
    WITH CHECK (true);

CREATE OR REPLACE POLICY "Users can view their own profile" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE OR REPLACE POLICY "Users can update their own profile" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Politique pour la table stagiaires
CREATE OR REPLACE POLICY "Enable insert for all users as stagiaire" ON stagiaires
    FOR INSERT 
    WITH CHECK (true);

CREATE OR REPLACE POLICY "Stagiaires can be viewed by anyone" ON stagiaires
    FOR SELECT 
    USING (true);

CREATE OR REPLACE POLICY "Stagiaires can update their own profile" ON stagiaires
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Politique pour la table entreprises
CREATE OR REPLACE POLICY "Enable insert for all users as entreprise" ON entreprises
    FOR INSERT 
    WITH CHECK (true);

CREATE OR REPLACE POLICY "Entreprises can be viewed by anyone" ON entreprises
    FOR SELECT 
    USING (true);

CREATE OR REPLACE POLICY "Entreprises can update their own profile" ON entreprises
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Politique pour la table contact_messages
CREATE OR REPLACE POLICY "Anyone can view contact messages" ON contact_messages
    FOR SELECT 
    USING (true);

CREATE OR REPLACE POLICY "Anyone can create contact messages" ON contact_messages
    FOR INSERT 
    WITH CHECK (true);
