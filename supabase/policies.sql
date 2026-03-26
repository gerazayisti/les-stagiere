-- ----------------------------------------------------------------------------
-- POLITIQUE DE SÉCURITÉ DE HAUT NIVEAU (RLS) - "Les Stagiaires"
-- Validé par l'audit de sécurité (Sprint 5)
-- ----------------------------------------------------------------------------

-- Extensions système
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ACTIVATION OBLIGATOIRE DE RLS SUR TOUTES LES TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stagiaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entreprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;


-- ----------------------------------------------------------------------------
-- 2. UTILISATEURS / STAGIAIRES / ENTREPRISES (Profils & Comptes)
-- ----------------------------------------------------------------------------

-- A. Table Auth (App / Meta)
CREATE POLICY "Enable insert for authenticated users" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable select for own user" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Enable update for own user" ON public.users FOR UPDATE USING (auth.uid() = id);

-- B. Stagiaires
CREATE POLICY "Stagiaires visibles publiquement" ON public.stagiaires FOR SELECT USING (true);
CREATE POLICY "Stagiaire peut creer son profil" ON public.stagiaires FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Stagiaire modifie son propre profil" ON public.stagiaires FOR UPDATE USING (auth.uid() = id);

-- C. Entreprises
CREATE POLICY "Entreprises visibles publiquement" ON public.entreprises FOR SELECT USING (true);
CREATE POLICY "Entreprise peut creer son profil" ON public.entreprises FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Entreprise modifie son propre profil" ON public.entreprises FOR UPDATE USING (auth.uid() = id);


-- ----------------------------------------------------------------------------
-- 3. OFFRES DE STAGES
-- ----------------------------------------------------------------------------
-- Bloque la création ou suppression pirate d'offres

-- Tout le monde (visiteurs inclus) peut lire les offres
CREATE POLICY "Offres de stages lues par tous" ON public.stages 
  FOR SELECT USING (true);

-- Seule l'entreprise peut publier en indiquant SON id
CREATE POLICY "Entreprise insere ses propres stages" ON public.stages 
  FOR INSERT WITH CHECK (entreprise_id = auth.uid());

-- Seule l'entreprise peut modifier ses annonces
CREATE POLICY "Entreprise modifie ses propres stages" ON public.stages 
  FOR UPDATE USING (entreprise_id = auth.uid());
  
-- Seule l'entreprise peut supprimer son annonce  
CREATE POLICY "Entreprise supprime ses propres stages" ON public.stages 
  FOR DELETE USING (entreprise_id = auth.uid());


-- ----------------------------------------------------------------------------
-- 4. CANDIDATURES (Matchs Stage / Etudiants)
-- ----------------------------------------------------------------------------

-- Un étudiant voit ses propres candidatures, et une entreprise ne voit QUE celles déposées sur SA propre offre
CREATE POLICY "Visibilité croisée des candidatures" ON public.candidatures 
  FOR SELECT 
  USING (
    stagiaire_id = auth.uid() 
    OR 
    stage_id IN (SELECT id FROM public.stages WHERE entreprise_id = auth.uid())
  );

-- Tout étudiant peut candidater pour lui-même
CREATE POLICY "Stagiaire cree sa candidature" ON public.candidatures 
  FOR INSERT WITH CHECK (stagiaire_id = auth.uid());

-- Mise à jour du statut (accepté/refusé) : 
-- Soit c'est l'étudiant (pour annuler), soit c'est le recruteur (pour valider)
CREATE POLICY "Mise à jour d'une candidature" ON public.candidatures 
  FOR UPDATE 
  USING (
    stagiaire_id = auth.uid() 
    OR 
    stage_id IN (SELECT id FROM public.stages WHERE entreprise_id = auth.uid())
  );


-- ----------------------------------------------------------------------------
-- 5. MESSAGES DE CONTACT (Le grand nettoyage)
-- ----------------------------------------------------------------------------

-- Tout utilisateur peut nous envoyer un message depuis le Front
CREATE POLICY "Insertion de messages publics" ON public.contact_messages 
  FOR INSERT WITH CHECK (true);

-- ON DÉTRUIT VOLONTAIREMENT LA POLITIQUE `SELECT USING (true)` EXISTANTE QUI ÉTAIT DANGEREUSE.
-- Désormais, comme RLS est "ENABLE", l'affichage des messages échouera systématiquement depuis le client Web !
-- Seul l'Administrateur ayant la clé SERVICE_ROLE pourra lire les messages.


-- ----------------------------------------------------------------------------
-- 6. DOCUMENTS (Portfolio / CV / Letrre)
-- ----------------------------------------------------------------------------
CREATE POLICY "Enable insert for documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = stagiaire_id);
-- Les documents "public" sont accessibles, sinon privé.
CREATE POLICY "Enable select for own documents" ON public.documents 
  FOR SELECT USING (
    auth.uid() = stagiaire_id 
    OR 
    is_public = true
    OR
    EXISTS (
      SELECT 1 FROM public.candidatures c
      JOIN public.stages s ON c.stage_id = s.id
      WHERE (c.cv_id = public.documents.id OR c.lettre_motivation_id = public.documents.id)
      AND s.entreprise_id = auth.uid()
    )
  );
CREATE POLICY "Enable update for own documents" ON public.documents FOR UPDATE USING (auth.uid() = stagiaire_id);
CREATE POLICY "Enable delete for own documents" ON public.documents FOR DELETE USING (auth.uid() = stagiaire_id);
