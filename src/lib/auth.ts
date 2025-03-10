import { supabase } from './supabase';
import { toast } from 'sonner';
import { AuthError, AuthResponse, SignInData, SignUpData, SupabaseAuthError, User } from '@/types/auth';

export type UserRole = 'stagiaire' | 'entreprise' | 'admin';

// Fonction pour vérifier si un profil existe déjà
async function checkProfileExists(id: string, table: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from(table)
      .select('id')
      .eq('id', id)
      .maybeSingle();
      
    return !!data;
  } catch (error) {
    console.error(`Exception lors de la vérification dans ${table}:`, error);
    return false;
  }
}

// Fonction pour créer les données utilisateur dans les tables publiques
export async function createUserProfile(userData: { 
  id: string, 
  email: string, 
  role: UserRole, 
  name: string 
}): Promise<AuthResponse> {
  const { id, email, role, name } = userData;
  
  try {
    console.log("Création du profil pour:", userData);
    
    // 1. Créer d'abord dans la table users
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id,
        email,
        role,
        name,
        is_active: true,
      }, { onConflict: 'id' });

    if (userError) {
      console.error("Erreur lors de l'insertion dans users:", userError);
      throw userError;
    }
    
    // 2. Créer le profil spécifique selon le rôle
    if (role === 'stagiaire') {
      const { error: stagiaireError } = await supabase
        .from('stagiaires')
        .upsert({
          id,
          name,
          email,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          skills: [],
          languages: [],
          preferred_locations: []
        }, { onConflict: 'id' });

      if (stagiaireError) {
        console.error("Erreur lors de l'insertion dans stagiaires:", stagiaireError);
        throw stagiaireError;
      }
    } 
    else if (role === 'entreprise') {
      const { error: entrepriseError } = await supabase
        .from('entreprises')
        .upsert({
          id,
          name,
          email,
          logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          industry: '',
          location: '',
          benefits: [],
          website: ''
        }, { onConflict: 'id' });

      if (entrepriseError) {
        console.error("Erreur lors de l'insertion dans entreprises:", entrepriseError);
        throw entrepriseError;
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la création du profil:', error);
    return { 
      success: false, 
      error: {
        message: error.message || "Erreur lors de la création du profil",
        status: error.code === '23505' ? 409 : 500,
        isRetryable: true
      }
    };
  }
}

export const auth = {
  // Inscription d'un nouvel utilisateur - MODIFIÉE POUR SIMPLIFIER
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const { email, password, role, name } = data;
    
    try {
      // 1. Validation des données
      if (!email || !password || !role || !name) {
        return {
          success: false,
          error: {
            message: "Toutes les informations sont requises",
            status: 400
          }
        };
      }
      
      console.log("Tentative d'inscription avec les données:", {
        email,
        role,
        name,
        password: "********"
      });
      
      // 2. Inscription via Supabase Auth - UNIQUEMENT email et password
      // Important: Nous ne passons AUCUNE métadonnée, pas même les options
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) {
        console.error("Erreur lors de l'inscription:", signUpError);
        return {
          success: false,
          error: {
            message: signUpError.message,
            status: 500,
            isRetryable: true
          }
        };
      }

      if (authData?.user) {
        // Stocker les informations temporairement pour la création du profil après confirmation
        localStorage.setItem(`userProfile_${authData.user.id}`, JSON.stringify({
          id: authData.user.id,
          email: authData.user.email,
          role,
          name
        }));
        
        toast.success("Inscription réussie", {
          description: "Vérifiez votre email pour confirmer votre compte"
        });
        
        return { success: true, data: authData };
      }
      
      return {
        success: false,
        error: {
          message: "Erreur lors de la création du compte",
          status: 500,
          isRetryable: true
        }
      };
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      
      const message = error.message?.includes("already registered") 
        ? "Cette adresse email est déjà utilisée"
        : "Une erreur est survenue lors de l'inscription";
      
      toast.error("Erreur d'inscription", {
        description: message
      });
      
      return {
        success: false,
        error: {
          message,
          status: error.status || 500,
          isRetryable: !error.message?.includes("already registered")
        }
      };
    }
  },

  // Connexion d'un utilisateur existant
  async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Veuillez confirmer votre email avant de vous connecter");
        }
        throw error;
      }
      
      // Vérifier si le profil existe, sinon le créer à partir des données stockées
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (!userData && !userError) {
          // Le profil n'existe pas encore, vérifier s'il y a des données stockées
          const storedProfileData = localStorage.getItem(`userProfile_${data.user.id}`);
          
          if (storedProfileData) {
            await this.createProfileAfterConfirmation(data.user.id);
          }
        }
      }
      
      toast.success("Connexion réussie", {
        description: `Bienvenue, ${data.user.user_metadata?.name || data.user.email}`
      });
      
      return { user: data.user };
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      
      let message = "Identifiants incorrects";
      
      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou mot de passe incorrect";
      } else if (error.message.includes("Email not confirmed") || error.message.includes("confirmer votre email")) {
        message = "Veuillez confirmer votre email avant de vous connecter";
      }
      
      toast.error("Échec de connexion", {
        description: message
      });
      
      throw new Error(message);
    }
  },

  // Renvoyer l'email de confirmation
  async resendConfirmationEmail(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmation`
        }
      });
      
      if (error) throw error;
      
      toast.success("Email envoyé", {
        description: "Un nouvel email de confirmation a été envoyé"
      });
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de l'email de confirmation:", error);
      
      toast.error("Erreur", {
        description: "Impossible d'envoyer l'email de confirmation"
      });
      
      throw error;
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
  },

  // Création du profil après confirmation de l'email
  async createProfileAfterConfirmation(userId: string): Promise<AuthResponse> {
    try {
      const storedProfileData = localStorage.getItem(`userProfile_${userId}`);
      
      if (!storedProfileData) {
        return {
          success: false,
          error: {
            message: "Informations de profil non trouvées",
            status: 404
          }
        };
      }
      
      const profileData = JSON.parse(storedProfileData);
      
      // Créer les profils utilisateur
      const result = await createUserProfile({
        id: userId,
        email: profileData.email,
        role: profileData.role,
        name: profileData.name
      });
      
      if (result.success) {
        // Supprimer les données temporaires
        localStorage.removeItem(`userProfile_${userId}`);
      }
      
      return result;
    } catch (error: any) {
      console.error('Erreur lors de la création du profil:', error);
      return {
        success: false,
        error: {
          message: error.message || "Erreur lors de la création du profil",
          status: error.code === '23505' ? 409 : 500,
          isRetryable: true
        }
      };
    }
  },
};
