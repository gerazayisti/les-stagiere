

-- First, make sure we enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Disable RLS on all tables for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stagiaires DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entreprises DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidatures DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stagiaire_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions DISABLE ROW LEVEL SECURITY;

-- Delete all existing policies for testing
-- Users policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;
DROP POLICY IF EXISTS "Enable update for own user" ON public.users;

-- Stagiaires policies
DROP POLICY IF EXISTS "Enable insert for stagiaires" ON public.stagiaires;
DROP POLICY IF EXISTS "Enable select for stagiaires" ON public.stagiaires;
DROP POLICY IF EXISTS "Enable update for own stagiaire" ON public.stagiaires;

-- Entreprises policies
DROP POLICY IF EXISTS "Enable insert for entreprises" ON public.entreprises;
DROP POLICY IF EXISTS "Enable select for entreprises" ON public.entreprises;
DROP POLICY IF EXISTS "Enable update for own entreprise" ON public.entreprises;

-- Documents policies
DROP POLICY IF EXISTS "Enable insert for documents" ON public.documents;
DROP POLICY IF EXISTS "Enable select for own documents" ON public.documents;
DROP POLICY IF EXISTS "Enable update for own documents" ON public.documents;
DROP POLICY IF EXISTS "Enable delete for own documents" ON public.documents;

-- Skills policies
DROP POLICY IF EXISTS "Anyone can view skills" ON public.skills;
DROP POLICY IF EXISTS "Admin can manage skills" ON public.skills;

-- Recommendations policies
DROP POLICY IF EXISTS "Entreprises can create recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Entreprises can update their recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Anyone can view public recommendations" ON public.recommendations;

-- Stagiaire_skills policies
DROP POLICY IF EXISTS "Stagiaires can manage their skills" ON public.stagiaire_skills;
DROP POLICY IF EXISTS "Anyone can view stagiaire skills" ON public.stagiaire_skills;

-- Tags and Stage_tags policies
DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
DROP POLICY IF EXISTS "Admin can manage tags" ON public.tags;
DROP POLICY IF EXISTS "Anyone can view stage_tags" ON public.stage_tags;
DROP POLICY IF EXISTS "Entreprises can manage stage_tags for their stages" ON public.stage_tags;

-- Login_history policies
DROP POLICY IF EXISTS "Users can view their own login history" ON public.login_history;
DROP POLICY IF EXISTS "Admin can view all login history" ON public.login_history;

-- User_settings policies
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;

-- Contact messages policies
DROP POLICY IF EXISTS "Anyone can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can create contact messages" ON public.contact_messages;

-- Comment to explain what was done
COMMENT ON SCHEMA public IS 'All RLS policies have been temporarily disabled for debugging authentication issues.';
