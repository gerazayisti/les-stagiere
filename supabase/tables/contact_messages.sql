
-- Création ou mise à jour de la table contact_messages
DROP TABLE IF EXISTS contact_messages;

CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'non_lu',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation de la sécurité RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre les insertions par tous les utilisateurs (y compris anonymes)
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
    FOR INSERT 
    WITH CHECK (true);

-- Politique pour permettre la lecture par les administrateurs
CREATE POLICY "Admin can view all contact messages" ON contact_messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );
