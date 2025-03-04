
# Guide de configuration du formulaire de contact

Ce document explique comment configurer et modifier le formulaire de contact de l'application AfriTech Stages.

## Configuration actuelle

Le formulaire de contact envoie actuellement les messages à l'adresse email **gerazayisti@gmail.com** et stocke ces messages dans la base de données Supabase dans la table `contact_messages`.

## Structure de la table dans Supabase

La table `contact_messages` dans Supabase doit avoir la structure suivante :

```sql
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT DEFAULT 'non_lu',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Comment modifier l'adresse email de destination

Pour modifier l'adresse email de destination des messages du formulaire de contact :

1. Ouvrez le fichier `src/pages/Contact.tsx`
2. Recherchez la ligne contenant `recipient_email: "gerazayisti@gmail.com"`
3. Remplacez `gerazayisti@gmail.com` par la nouvelle adresse email de destination

```javascript
recipient_email: "nouvelle-adresse@example.com"
```

## Configuration de l'envoi d'emails automatiques (optionnel)

Pour configurer l'envoi automatique d'emails via Supabase :

1. Dans le dashboard Supabase, activez la fonction d'envoi d'email
2. Créez une edge function ou utilisez des déclencheurs de base de données (database triggers) pour envoyer automatiquement les emails
3. Configurez un webhook ou une fonction de background pour traiter les nouveaux messages

## Personnalisation du formulaire

Pour ajouter ou modifier les champs du formulaire :

1. Mettez à jour le schéma de validation Zod dans le fichier `Contact.tsx` :

```javascript
const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  // Ajoutez vos nouveaux champs ici
  phone: z.string().optional(),
});
```

2. Ajoutez les nouveaux champs au formulaire dans la partie JSX
3. Assurez-vous de mettre à jour l'objet d'insertion Supabase pour inclure les nouveaux champs

## Dépannage

Si vous rencontrez des erreurs lors de l'envoi de messages :

1. Vérifiez les logs de console pour les messages d'erreur spécifiques
2. Assurez-vous que la table `contact_messages` existe dans votre base de données Supabase
3. Vérifiez que les noms de colonnes dans le code correspondent exactement aux noms de colonnes dans la table Supabase
4. Confirmez que vos règles de sécurité (RLS) permettent les insertions dans la table `contact_messages`
