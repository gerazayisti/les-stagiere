-- Politiques de sécurité RLS pour Supabase

-- First, make sure we enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create helper function to get user table based on role
CREATE OR REPLACE FUNCTION public.get_user_table(role text)
RETURNS text AS $$
BEGIN
    CASE role
        WHEN 'stagiaire' THEN RETURN 'stagiaires';
        WHEN 'entreprise' THEN RETURN 'entreprises';
        ELSE RETURN NULL;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger function to automatically create profile entry with better transaction handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    _role text;
    _name text;
BEGIN
    -- Get role and name from metadata, with defaults
    _role := COALESCE(NEW.raw_user_meta_data->>'role', 'stagiaire');
    _name := COALESCE(NEW.raw_user_meta_data->>'name', '');
    
    -- First insert into users table
    BEGIN
        INSERT INTO public.users (id, email, role, name)
        VALUES (NEW.id, NEW.email, _role, _name);
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting into users: %', SQLERRM;
        RETURN NULL;
    END;
    
    -- Then insert into specific profile table based on role
    BEGIN
        IF _role = 'stagiaire' THEN
            INSERT INTO public.stagiaires (id, name, email)
            VALUES (NEW.id, _name, NEW.email);
        ELSIF _role = 'entreprise' THEN
            INSERT INTO public.entreprises (id, name, email)
            VALUES (NEW.id, _name, NEW.email);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting into profile table: %', SQLERRM;
        -- Don't fail the entire transaction if profile creation fails
        -- The user can complete their profile later
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

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
CREATE OR REPLACE POLICY "Anyone can view contact messages" ON contact_messages
    FOR SELECT 
    USING (true);

CREATE OR REPLACE POLICY "Anyone can create contact messages" ON contact_messages
    FOR INSERT 
    WITH CHECK (true);
