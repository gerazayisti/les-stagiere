
-- Politiques de sécurité RLS pour Supabase

-- First, make sure we enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set up basic RLS policies
CREATE POLICY "Enable insert for registration" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for own user" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Enable update for own user" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for stagiaires" ON stagiaires FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for stagiaires" ON stagiaires FOR SELECT USING (true);
CREATE POLICY "Enable update for own stagiaire" ON stagiaires FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for entreprises" ON entreprises FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for entreprises" ON entreprises FOR SELECT USING (true);
CREATE POLICY "Enable update for own entreprise" ON entreprises FOR UPDATE USING (auth.uid() = id);

-- Enable RLS on main tables
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stagiaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;

-- Politique pour la table contact_messages
CREATE POLICY "Anyone can view contact messages" ON contact_messages
    FOR SELECT 
    USING (true);

CREATE POLICY "Anyone can create contact messages" ON contact_messages
    FOR INSERT 
    WITH CHECK (true);
