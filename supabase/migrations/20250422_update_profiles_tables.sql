-- Migration: Mise à jour des tables stagiaires et entreprises
-- Date: 2025-04-22

-- Ajout des colonnes manquantes à la table stagiaires
ALTER TABLE IF EXISTS stagiaires 
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS social_links JSONB,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Conversion de education en tableau
ALTER TABLE IF EXISTS stagiaires 
  ALTER COLUMN education TYPE TEXT[] USING ARRAY[education];

-- Ajout des colonnes manquantes à la table entreprises
ALTER TABLE IF EXISTS entreprises 
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Renommer la colonne verified en is_verified (si elle existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'entreprises' AND column_name = 'verified'
  ) THEN
    ALTER TABLE entreprises RENAME COLUMN verified TO is_verified;
  ELSE 
    ALTER TABLE entreprises ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
  END IF;
END
$$;

-- Mise à jour des données existantes pour email si NULL
UPDATE stagiaires s
SET email = u.email
FROM users u
WHERE s.id = u.id AND s.email IS NULL;

UPDATE entreprises e
SET email = u.email
FROM users u
WHERE e.id = u.id AND e.email IS NULL;

-- Initialiser les tableaux vides si NULL
UPDATE stagiaires
SET skills = '{}'::TEXT[]
WHERE skills IS NULL;

UPDATE stagiaires
SET languages = '{}'::TEXT[]
WHERE languages IS NULL;

UPDATE stagiaires
SET education = '{}'::TEXT[]
WHERE education IS NULL;

-- Initialiser les objets JSON vides si NULL
UPDATE stagiaires
SET social_links = '{}'::jsonb 
WHERE social_links IS NULL;
