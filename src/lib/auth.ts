
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

// Fonction pour créer les données utilisateur dans les tables publiques
export async function createUserProfile(userData: { 
  id: string, 
  email: string, 
  role: UserRole, 
  name: string 
}) {
  const { id, email, role, name } = userData;
  
  try {
    console.log(`Création du profil utilisateur pour ${id} avec le rôle ${role}`);
    
    // 1. Créer l'entrée dans la table users (principale)
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id,
        email,
        role,
        name,
        is_active: true,
      });

    if (userError) {
      console.error("Erreur lors de la création dans la table users:", userError);
      return { success: false, error: userError };
    }
    
    // 2. Selon le rôle, créer l'entrée spécifique
    if (role === 'stagiaire') {
      const { error: stagiaireError } = await supabase
        .from('stagiaires')
        .insert({
          id,
          name,
          email,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          skills: [],
          languages: [],
          preferred_locations: []
        });

      if (stagiaireError) {
        console.error("Erreur lors de la création du stagiaire:", stagiaireError);
        return { success: false, error: stagiaireError };
      }
    } 
    else if (role === 'entreprise') {
      const { error: entrepriseError } = await supabase
        .from('entreprises')
        .insert({
          id,
          name,
          email,
          logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          industry: '',
          location: '',
          benefits: [],
          website: ''
        });

      if (entrepriseError) {
        console.error("Erreur lors de la création de l'entreprise:", entrepriseError);
        return { success: false, error: entrepriseError };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la création du profil utilisateur:', error);
    return { success: false, error };
  }
}

export const auth = {
  // Inscription d'un nouvel utilisateur
  async signUp(data: SignUpData) {
    const { email, password, role, name } = data;
    
    try {
      // 1. Validation des données
      if (!email || !password || !role || !name) {
        throw new Error("Toutes les informations sont requises");
      }
      
      if (password.length < 8) {
        throw new Error("Le mot de passe doit contenir au moins 8 caractères");
      }
      
      console.log("Tentative d'inscription avec les données:", {
        email,
        role,
        name,
        password: "********" // Masquer le mot de passe
      });
      
      // 2. Inscription via Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, name },
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

      console.log("Résultat de l'inscription:", authData);

      // 3. Si l'utilisateur est créé avec succès dans Auth, essayer de créer le profil
      if (authData?.user) {
        try {
          // Attendre un court délai pour s'assurer que l'utilisateur est bien créé dans auth
          // avant de créer le profil dans les tables publiques
          setTimeout(async () => {
            const userProfileResult = await createUserProfile({
              id: authData.user.id,
              email: authData.user.email || email,
              role,
              name
            });
            
            if (!userProfileResult.success) {
              console.warn("L'utilisateur a été créé dans auth mais pas dans les tables publiques", userProfileResult.error);
              // Ne pas interrompre le processus, l'utilisateur pourra compléter son profil plus tard
            } else {
              console.log("Profil utilisateur créé avec succès dans les tables publiques");
            }
          }, 500);
        } catch (profileError) {
          console.error("Erreur lors de la création du profil:", profileError);
          // Ne pas interrompre le processus d'inscription pour une erreur de profil
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

  // Connexion d'un utilisateur existant
  async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
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

  // Déconnexion
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  },

  // Récupération de l'utilisateur actuel
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

  // Réinitialisation du mot de passe
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
  
  // Mise à jour du mot de passe
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

  // Mise à jour du profil utilisateur
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
  },
  
  // Upload avatar
  async uploadAvatar(file: File, userId: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${userId}-${Date.now()}.${fileExt}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicURL } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      return publicURL.publicUrl;
    } catch (error) {
      console.error("Erreur lors de l'upload de l'avatar:", error);
      throw error;
    }
  },
  
  // Delete avatar
  async deleteAvatar(avatarUrl: string) {
    try {
      // Extract file path from the URL
      const urlParts = avatarUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('profiles') + 1).join('/');
      
      // Delete the file from Supabase Storage
      const { error } = await supabase.storage
        .from('profiles')
        .remove([filePath]);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'avatar:", error);
      throw error;
    }
  }
};
