import { supabase } from './supabase';
import { toast } from 'sonner';

export type UserRole = 'stagiaire' | 'entreprise' | 'admin';

interface SignUpData {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

interface SignInData {
  email: string;
  password: string;
}

// Fonction pour synchroniser un utilisateur avec les tables public
async function syncUserData(authUser: any) {
  if (!authUser) {
    console.warn("syncUserData appelé sans utilisateur");
    return;
  }

  console.log("Synchronisation des données utilisateur:", authUser.id);
  
  try {
    // Vérifier si l'utilisateur existe déjà dans la table users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', authUser.id)
      .single();

    // Insérer/mettre à jour dans la table users
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: authUser.id,
        email: authUser.email,
        role: authUser.user_metadata?.role || 'stagiaire',
        email_verified: authUser.email_confirmed_at ? true : false,
        is_active: true,
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (userError) {
      console.error("Erreur lors de la mise à jour de la table users:", userError);
      throw userError;
    }

    // Si c'est un stagiaire, synchroniser avec la table stagiaires
    if (authUser.user_metadata?.role === 'stagiaire') {
      // Vérifier si le stagiaire existe déjà
      const { data: existingStagiaire } = await supabase
        .from('stagiaires')
        .select('id, name')
        .eq('id', authUser.id)
        .single();

      if (!existingStagiaire) {
        const { error: stagiaireError } = await supabase
          .from('stagiaires')
          .insert({
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email.split('@')[0],
            email: authUser.email,
            avatar_url: authUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.user_metadata?.name || authUser.email.split('@')[0])}&background=random`,
            skills: [],
            languages: [],
            preferred_locations: [],
            last_active: new Date().toISOString(),
          });

        if (stagiaireError && !stagiaireError.message.includes('duplicate key')) {
          console.error("Erreur lors de l'insertion dans la table stagiaires:", stagiaireError);
          console.warn("Échec de l'insertion dans la table stagiaires, mais l'utilisateur a été créé");
        }
      } else {
        // Update only if exists
        const { error: stagiaireUpdateError } = await supabase
          .from('stagiaires')
          .update({
            name: authUser.user_metadata?.name || existingStagiaire.name,
            email: authUser.email,
            last_active: new Date().toISOString(),
          })
          .eq('id', authUser.id);

        if (stagiaireUpdateError) {
          console.error("Erreur lors de la mise à jour de la table stagiaires:", stagiaireUpdateError);
        }
      }
    }

    // Si c'est une entreprise, synchroniser avec la table entreprises
    if (authUser.user_metadata?.role === 'entreprise') {
      // Vérifier si l'entreprise existe déjà
      const { data: existingEntreprise } = await supabase
        .from('entreprises')
        .select('id, name')
        .eq('id', authUser.id)
        .single();

      if (!existingEntreprise) {
        const { error: entrepriseError } = await supabase
          .from('entreprises')
          .insert({
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email.split('@')[0],
            email: authUser.email,
            logo_url: authUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.user_metadata?.name || authUser.email.split('@')[0])}&background=random`,
            industry: authUser.user_metadata?.industry || '',
            location: authUser.user_metadata?.location || '',
            benefits: [],
            description: '',
            size: '',
          });

        if (entrepriseError && !entrepriseError.message.includes('duplicate key')) {
          console.error("Erreur lors de l'insertion dans la table entreprises:", entrepriseError);
          console.warn("Échec de l'insertion dans la table entreprises, mais l'utilisateur a été créé");
        }
      } else {
        // Update only if exists
        const { error: entrepriseUpdateError } = await supabase
          .from('entreprises')
          .update({
            name: authUser.user_metadata?.name || existingEntreprise.name,
            email: authUser.email,
          })
          .eq('id', authUser.id);

        if (entrepriseUpdateError) {
          console.error("Erreur lors de la mise à jour de la table entreprises:", entrepriseUpdateError);
        }
      }
    }
    
    console.log("Synchronisation terminée avec succès");
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation des données:', error);
    return false;
  }
}

// Initialiser l'écoute des changements auth
export const initAuthListener = () => {
  // Écouter les changements de session
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state change:", event);
    
    if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
      try {
        await syncUserData(session?.user);
      } catch (error) {
        console.error("Erreur lors de la synchronisation après événement auth:", error);
      }
    }
  });
  
  console.log("Auth listener initialisé");
};

// Fonction pour télécharger et supprimer un avatar
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const deleteAvatar = async (url: string): Promise<void> => {
  const path = url.split('/').pop();
  if (!path) return;
  
  const { error } = await supabase.storage
    .from('public')
    .remove([`avatars/${path}`]);

  if (error) throw error;
};

export const auth = {
  async signUp(data: SignUpData) {
    const { email, password, role, name } = data;
    
    try {
      console.log("Tentative d'inscription...");
      
      // Vérification des données
      if (!email || !password || !role || !name) {
        throw new Error("Toutes les informations sont requises");
      }
      
      // Vérification de la complexité du mot de passe
      if (password.length < 8) {
        throw new Error("Le mot de passe doit contenir au moins 8 caractères");
      }
      
      // Inscription via Supabase avec options simplifiées
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
          },
          emailRedirectTo: `${window.location.origin}/connexion?email_confirmed=true`
        },
      });

      if (signUpError) {
        console.error("Erreur de création du compte:", signUpError);
        
        // Gestion spécifique des erreurs Supabase
        if (signUpError.message.includes("already registered")) {
          throw new Error("Cette adresse email est déjà utilisée");
        }
        
        throw signUpError;
      }

      // Si la création du compte a réussi
      toast.success("Inscription réussie", {
        description: "Vérifiez votre email pour confirmer votre compte"
      });
      
      return { data: signUpData };
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      
      let message = "Une erreur est survenue lors de l'inscription";
      
      // Gestion plus précise des erreurs
      if (error.message?.includes("User already registered") || 
          error.message?.includes("already registered") ||
          error.code === "23505") {
        message = "Cette adresse email est déjà utilisée";
      } else if (error.message?.includes("Password should be")) {
        message = "Le mot de passe doit contenir au moins 6 caractères";
      } else if (error.status === 500 || error.code === "unexpected_failure") {
        message = "Erreur serveur. Veuillez réessayer ultérieurement.";
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error("Erreur d'inscription", {
        description: message
      });
      
      throw new Error(message);
    }
  },

  async signIn({ email, password }: SignInData) {
    try {
      console.log("Tentative de connexion...");
      
      // Connexion via Supabase
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) throw result.error;
      
      console.log("Connexion réussie:", result.data.user);
      
      // Synchroniser immédiatement les données utilisateur
      await syncUserData(result.data.user);
      
      toast.success("Connexion réussie", {
        description: `Bienvenue, ${result.data.user.user_metadata?.name || result.data.user.email}`
      });
      
      return { user: result.data.user };
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      
      let message = "Identifiants incorrects";
      
      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou mot de passe incorrect";
      } else if (error.message.includes("Email not confirmed")) {
        message = "Veuillez confirmer votre email avant de vous connecter";
      }
      
      toast.error("Échec de connexion", {
        description: message
      });
      
      throw new Error(message);
    }
  },

  async signOut() {
    try {
      console.log("Tentative de déconnexion depuis auth.ts...");
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      console.log("Déconnexion réussie depuis auth.ts");
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) return null;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  // Fonction pour mettre à jour le profil utilisateur
  async updateProfile(userData: any) {
    try {
      const { data: authData, error: updateError } = await supabase.auth.updateUser({
        data: userData
      });

      if (updateError) throw updateError;

      // Synchroniser les données avec les tables publiques
      await syncUserData(authData.user);
      
      toast.success("Profil mis à jour avec succès");
      
      return authData;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      
      toast.error("Erreur", {
        description: "Impossible de mettre à jour le profil"
      });
      
      throw error;
    }
  },

  // Fonctions pour les avatars
  uploadAvatar,
  deleteAvatar,
  
  // Fonction pour réinitialiser le mot de passe
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      toast.success("Email envoyé", {
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe"
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de l'envoi du mail de réinitialisation:", error);
      
      toast.error("Erreur", {
        description: "Impossible d'envoyer l'email de réinitialisation"
      });
      
      throw error;
    }
  },
  
  // Fonction pour mettre à jour le mot de passe
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Mot de passe mis à jour", {
        description: "Votre mot de passe a été modifié avec succès"
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      
      toast.error("Erreur", {
        description: "Impossible de mettre à jour le mot de passe"
      });
      
      throw error;
    }
  }
};
