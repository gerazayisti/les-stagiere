-- Migration: Création des buckets de stockage
-- Date: 2025-04-23

-- Créer le bucket 'cvdocuments' s'il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('cvdocuments', 'cvdocuments', true, 10485760, -- 10MB
   ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']::text[])
ON CONFLICT (id) DO NOTHING;

-- Ajouter une politique pour permettre l'accès public en lecture
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES 
  ('Public Read Access', '(bucket_id = ''cvdocuments''::text)', 'cvdocuments')
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Ajouter une politique pour permettre l'upload aux utilisateurs authentifiés
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES 
  ('Auth Users Upload', '(bucket_id = ''cvdocuments''::text AND auth.role() = ''authenticated''::text)', 'cvdocuments')
ON CONFLICT (name, bucket_id) DO NOTHING;
