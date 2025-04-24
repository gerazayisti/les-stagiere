-- Ajout direct des colonnes manquantes
ALTER TABLE candidatures ADD COLUMN IF NOT EXISTS status_change_reason TEXT;
ALTER TABLE candidatures ADD COLUMN IF NOT EXISTS status_changed_by VARCHAR(50);
