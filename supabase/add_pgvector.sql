-- Script d'activation de la recherche vectorielle (IA Matchmaking)
-- À exécuter dans le SQL Editor de Supabase Cloud

-- 1. Activer l'extension "vector" (nécessite les privilèges administrateur, généralement par défaut sur Supabase)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Ajouter les colonnes "embedding" sur les tables principales
-- On utilise la dimension 768 qui correspond au modèle Google Gemini text-embedding-004
ALTER TABLE public.stages ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE public.stagiaires ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Créer des index pour optimiser la recherche par similarité (Cosinus = <=> operator)
-- HNSW (Hierarchical Navigable Small World) est idéal pour ça.
CREATE INDEX IF NOT EXISTS stages_embedding_idx ON public.stages USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS stagiaires_embedding_idx ON public.stagiaires USING hnsw (embedding vector_cosine_ops);

-- 4. Créer la fonction RPC (Remote Procedure Call) de recommandation de stages
CREATE OR REPLACE FUNCTION get_recommended_stages(
  p_stagiaire_id uuid,
  match_threshold float DEFAULT 0.50
)
RETURNS TABLE (
  id uuid,
  title varchar,
  description text,
  location varchar,
  type stage_type,
  duration varchar,
  start_date date,
  required_skills text[],
  entreprise_id uuid,
  status varchar,
  created_at timestamp,
  entreprise_name varchar,
  entreprise_logo_url text,
  match_score float
) 
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_embedding vector(768);
BEGIN
  -- Récupérer l'empreinte mathématique (vecteur) du profil stagiaire
  SELECT embedding INTO v_embedding FROM public.stagiaires WHERE stagiaires.id = p_stagiaire_id;
  
  -- Si le stagiaire n'a pas encore de vecteur généré, ne rien retourner.
  IF v_embedding IS NULL THEN
     RETURN;
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.description,
    s.location,
    s.type,
    s.duration,
    s.start_date,
    s.required_skills,
    s.entreprise_id,
    s.status,
    s.created_at,
    e.name AS entreprise_name,
    e.logo_url AS entreprise_logo_url,
    -- Le calcul de similarité cosinus. 1 signifie 'parfaite correspondance'
    1 - (s.embedding <=> v_embedding) AS match_score
  FROM public.stages s
  JOIN public.entreprises e ON e.id = s.entreprise_id
  WHERE s.status = 'active'
    AND s.embedding IS NOT NULL
    AND (1 - (s.embedding <=> v_embedding)) > match_threshold
  ORDER BY s.embedding <=> v_embedding
  LIMIT 30;
END;
$$;
