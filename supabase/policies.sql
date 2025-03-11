
-- First, make sure we enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Disable RLS on auth.users as it's managed by Supabase Auth
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Enable RLS on public tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stagiaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entreprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Enable read access for all users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for registration"
    ON public.users FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for own user"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Stagiaires policies
CREATE POLICY "Enable insert for stagiaires"
    ON public.stagiaires FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for stagiaires"
    ON public.stagiaires FOR SELECT
    USING (true);

CREATE POLICY "Enable update for own stagiaire"
    ON public.stagiaires FOR UPDATE
    USING (auth.uid() = id);

-- Entreprises policies
CREATE POLICY "Enable insert for entreprises"
    ON public.entreprises FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for entreprises"
    ON public.entreprises FOR SELECT
    USING (true);

CREATE POLICY "Enable update for own entreprise"
    ON public.entreprises FOR UPDATE
    USING (auth.uid() = id);

-- Documents policies
CREATE POLICY "Enable insert for documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = stagiaire_id);

CREATE POLICY "Enable select for own documents"
    ON public.documents FOR SELECT
    USING (auth.uid() = stagiaire_id OR is_public = true);

CREATE POLICY "Enable update for own documents"
    ON public.documents FOR UPDATE
    USING (auth.uid() = stagiaire_id);

CREATE POLICY "Enable delete for own documents"
    ON public.documents FOR DELETE
    USING (auth.uid() = stagiaire_id);

-- Contact messages policies
CREATE POLICY "Anyone can view contact messages"
    ON public.contact_messages FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create contact messages"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);
