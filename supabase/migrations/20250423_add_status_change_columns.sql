-- Migration: Ajouter les colonnes status_change_reason et status_changed_by à la table candidatures
-- Date: 2025-04-23

-- Vérifier si les colonnes existent déjà avant de les ajouter
DO $$
BEGIN
    -- Ajouter la colonne status_change_reason si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'candidatures' 
        AND column_name = 'status_change_reason'
    ) THEN
        ALTER TABLE candidatures ADD COLUMN status_change_reason TEXT;
    END IF;

    -- Ajouter la colonne status_changed_by si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'candidatures' 
        AND column_name = 'status_changed_by'
    ) THEN
        ALTER TABLE candidatures ADD COLUMN status_changed_by VARCHAR(50);
    END IF;
END
$$;
