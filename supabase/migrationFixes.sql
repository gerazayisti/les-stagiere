
-- Script de correction des problèmes potentiels de migration
-- Vérifie si les tables essentielles existent et les crée si nécessaire

-- Vérification et correction de la table users
DO $$
BEGIN
    -- Vérifie si la table users existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        -- Création de la table users
        CREATE TABLE public.users (
            id UUID PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            role user_role NOT NULL,
            name VARCHAR(255),
            is_active BOOLEAN DEFAULT true,
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP
        );
        
        -- Ajout des contraintes et index
        CREATE INDEX idx_users_email ON users(email);
    END IF;
    
    -- Vérifie si la colonne email_confirmed_at manque dans la table users
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email_confirmed_at'
    ) THEN
        -- Ajout de la colonne email_confirmed_at
        ALTER TABLE public.users ADD COLUMN email_confirmed_at TIMESTAMP;
    END IF;
END
$$;

-- Synchroniser les utilisateurs de auth.users vers public.users
CREATE OR REPLACE FUNCTION sync_auth_users()
RETURNS TRIGGER AS $$
BEGIN
    -- Pour les nouveaux utilisateurs
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.users (id, email, role, name, created_at)
        VALUES (
            NEW.id, 
            NEW.email, 
            COALESCE(NEW.raw_user_meta_data->>'role', 'stagiaire')::user_role, 
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            NEW.created_at
        )
        ON CONFLICT (id) DO NOTHING;
    
    -- Pour les mises à jour
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.users SET 
            email = NEW.email,
            role = COALESCE(NEW.raw_user_meta_data->>'role', users.role)::user_role,
            name = COALESCE(NEW.raw_user_meta_data->>'name', users.name),
            email_confirmed_at = NEW.email_confirmed_at,
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Création du trigger s'il n'existe pas déjà
DO $$
BEGIN
    -- Suppression du trigger s'il existe déjà (pour éviter les erreurs)
    DROP TRIGGER IF EXISTS trigger_sync_auth_users ON auth.users;
    
    -- Création du nouveau trigger
    CREATE TRIGGER trigger_sync_auth_users
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_users();
END
$$;
