
-- Politiques de sécurité RLS pour Supabase

-- Politique pour la table users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Assurez-vous que les utilisateurs nouvellement inscrits peuvent être insérés dans la table
CREATE POLICY "Auth service can insert new users" ON users
    FOR INSERT 
    WITH CHECK (true);

-- Politique pour la table stages
CREATE POLICY "Stages are viewable by everyone" ON stages
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Entreprises can create stages" ON stages
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IN (
        SELECT id FROM users WHERE role = 'entreprise'
    ));

CREATE POLICY "Entreprises can update their own stages" ON stages
    FOR UPDATE TO authenticated
    USING (entreprise_id = auth.uid());

-- Politique pour la table candidatures
CREATE POLICY "Stagiaires can view their own candidatures" ON candidatures
    FOR SELECT TO authenticated
    USING (stagiaire_id = auth.uid());

CREATE POLICY "Entreprises can view candidatures for their stages" ON candidatures
    FOR SELECT TO authenticated
    USING (stage_id IN (
        SELECT id FROM stages WHERE entreprise_id = auth.uid()
    ));

-- Politique pour la table contact_messages
-- Mise à jour de la politique pour inclure recipient_email
CREATE POLICY "Admin can view all contact messages" ON contact_messages
    FOR SELECT TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    ));

CREATE POLICY "Users can create contact messages" ON contact_messages
    FOR INSERT 
    WITH CHECK (true);

-- Ajouté: Politique pour les utilisateurs anonymes (non authentifiés) 
-- pour pouvoir insérer des messages de contact
CREATE POLICY "Anonymous users can create contact messages" ON contact_messages
    FOR INSERT 
    WITH CHECK (true);

-- Politique pour la table uploads
CREATE POLICY "Users can view their own uploads" ON uploads
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can upload their own files" ON uploads
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Politique pour la table messages
CREATE POLICY "Enable realtime for message participants" ON messages
    FOR SELECT TO authenticated
    USING (
        auth.uid() = from_user_id OR 
        auth.uid() = to_user_id
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Recipients can mark messages as read" ON messages
    FOR UPDATE TO authenticated
    USING (auth.uid() = to_user_id)
    WITH CHECK (
        auth.uid() = to_user_id AND
        OLD.read = false AND
        NEW.read = true AND
        OLD.content = NEW.content AND
        OLD.from_user_id = NEW.from_user_id AND
        OLD.to_user_id = NEW.to_user_id
    );

-- Politiques pour stagiaires et entreprises
CREATE POLICY "Stagiaires can be viewed by anyone" ON stagiaires
    FOR SELECT 
    USING (true);

CREATE POLICY "Stagiaires can update their own profile" ON stagiaires
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Stagiaires can insert their own profile" ON stagiaires
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Entreprises can be viewed by anyone" ON entreprises
    FOR SELECT 
    USING (true);

CREATE POLICY "Entreprises can update their own profile" ON entreprises
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Entreprises can insert their own profile" ON entreprises
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);
