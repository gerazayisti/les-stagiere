
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

// Fonction simplifiée pour créer une entrée dans la table users de Supabase
async function createPublicUser(user: any, role: string, name: string) {
  if (!user) return false;
  
  try {
    console.log(`Création d'un utilisateur public pour ${user.id} avec le rôle ${role}`);
    
    // Création dans la table users (principale)
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        role: role,
        is_active: true,
        name: name
      });

    if (userError) {
      console.error("Erreur lors de la création dans la table users:", userError);
      return false;
    }
    
    // Création dans la table spécifique au rôle
    if (role === 'stagiaire') {
      const { error: stagiaireError } = await supabase
        .from('stagiaires')
        .insert({
          id: user.id,
          name: name,
          email: user.email,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          skills: [],
          languages: [],
          preferred_locations: []
        });

      if (stagiaireError) {
        console.error("Erreur lors de la création du stagiaire:", stagiaireError);
      }
    } else if (role === 'entreprise') {
      const { error: entrepriseError } = await supabase
        .from('entreprises')
        .insert({
          id: user.id,
          name: name,
          email: user.email,
          logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          industry: '',
          location: '',
          benefits: []
        });

      if (entrepriseError) {
        console.error("Erreur lors de la création de l'entreprise:", entrepriseError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur public:', error);
    return false;
  }
}

export const auth = {
  async signUp(data: SignUpData) {
    const { email, password, role, name } = data;
    
    try {
      console.log("Tentative d'inscription simplifiée...");
      
      // 1. Vérification des données
      if (!email || !password || !role || !name) {
        throw new Error("Toutes les informations sont requises");
      }
      
      if (password.length < 8) {
        throw new Error("Le mot de passe doit contenir au moins 8 caractères");
      }
      
      // 2. Inscription via Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name
          },
          emailRedirectTo: `${window.location.origin}/connexion?email_confirmed=true`
        },
      });

      if (signUpError) {
        console.error("Erreur lors de l'inscription:", signUpError);
        
        if (signUpError.message.includes("already registered")) {
          throw new Error("Cette adresse email est déjà utilisée");
        }
        
        throw signUpError;
      }

      // 3. Créer l'utilisateur dans les tables publiques
      if (authData?.user) {
        const publicUserCreated = await createPublicUser(authData.user, role, name);
        
        if (!publicUserCreated) {
          console.warn("L'utilisateur a été créé dans auth mais pas dans les tables publiques");
        }
      }
      
      toast.success("Inscription réussie", {
        description: "Vérifiez votre email pour confirmer votre compte"
      });
      
      return { success: true, data: authData };
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      
      let message = "Une erreur est survenue lors de l'inscription";
      
      if (error.message?.includes("already registered")) {
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log("Connexion réussie:", data.user);
      
      toast.success("Connexion réussie", {
        description: `Bienvenue, ${data.user.user_metadata?.name || data.user.email}`
      });
      
      return { user: data.user };
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
      console.log("Tentative de déconnexion...");
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      console.log("Déconnexion réussie");
      
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
  },

  // Fonction pour mettre à jour le profil utilisateur
  async updateProfile(userData: any) {
    try {
      const { data: authData, error: updateError } = await supabase.auth.updateUser({
        data: userData
      });

      if (updateError) throw updateError;
      
      toast.success("Profil mis à jour avec succès");
      
      return authData;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      
      toast.error("Erreur", {
        description: "Impossible de mettre à jour le profil"
      });
      
      throw error;
    }
  }
};
