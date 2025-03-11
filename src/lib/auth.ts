
import { supabase } from './supabase';
import { toast } from 'sonner';
import { AuthError, AuthResponse, SignInData, SignUpData, SupabaseAuthError, User } from '@/types/auth';

export type UserRole = 'stagiaire' | 'entreprise' | 'admin';

async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();
      
    return !!data;
  } catch (error) {
    console.error(`Erreur lors de la vérification de l'email:`, error);
    return false;
  }
}

export async function createUserProfile(userData: { 
  id: string, 
  email: string, 
  role: UserRole, 
  name: string 
}): Promise<AuthResponse> {
  const { id, email, role, name } = userData;
  
  try {
    console.log("Création du profil pour:", userData);
    
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
    
    if (role === 'stagiaire') {
      const { error: stagiaireError } = await supabase
        .from('stagiaires')
        .upsert({
          id,
          name,
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
  async checkEmailExists(email: string): Promise<boolean> {
    return checkEmailExists(email);
  },

  async signUp(data: SignUpData): Promise<AuthResponse> {
    const { email, password, role, name } = data;
    
    try {
      if (!email || !password || !role || !name) {
        return {
          success: false,
          error: {
            message: "Toutes les informations sont requises",
            status: 400
          }
        };
      }
      
      try {
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
          return {
            success: false,
            error: {
              message: "Cette adresse email est déjà utilisée",
              status: 409,
              isRetryable: false
            }
          };
        }
      } catch (emailCheckError) {
        console.warn("Erreur lors de la vérification d'email:", emailCheckError);
      }
      
      console.log("Tentative d'inscription avec email/password:", {
        email,
        password: "********"
      });
      
      try {
        const origin = window.location.origin;
        const redirectUrl = origin.includes('localhost') 
          ? `${origin}/email-confirmation` 
          : `${origin}/email-confirmation?type=signup`;
        
        console.log("Using redirect URL:", redirectUrl);
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role
            },
            emailRedirectTo: redirectUrl
          }
        });

        if (signUpError) {
          console.error("Erreur Supabase lors de l'inscription:", signUpError);
          
          if (signUpError.message?.includes("already registered")) {
            return {
              success: false,
              error: {
                message: "Cette adresse email est déjà utilisée",
                status: 409,
                isRetryable: false
              }
            };
          }
          
          return {
            success: false,
            error: {
              message: `Erreur d'inscription: ${signUpError.message}`,
              status: signUpError.status || 500,
              isRetryable: true
            }
          };
        }

        if (authData?.user) {
          try {
            await supabase.from('users').upsert({
              id: authData.user.id,
              email: email,
              role: role,
              name: name,
              is_active: true
            }, { onConflict: 'id' });
            
            if (role === 'stagiaire') {
              await supabase.from('stagiaires').upsert({
                id: authData.user.id,
                name,
                email,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&size=128&background=random&format=.png`,
                is_verified: false,
                bio: `${name} est à la recherche d'un stage.`,
                created_at: new Date().toISOString(),
                education: [],
                skills: [],
                languages: [],
                social_links: {},
                is_premium: false,
                disponibility: "upcoming"
              }, { onConflict: 'id' });
            } else if (role === 'entreprise') {
              await supabase.from('entreprises').upsert({
                id: authData.user.id,
                name,
                email: email,
                logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&size=128&background=random&format=.png`,
                is_verified: false,
                description: `${name} est une entreprise qui recherche des stagiaires.`,
                created_at: new Date().toISOString(),
                industry: '',
                location: '',
                website: ''
              }, { onConflict: 'id' });
            }
            
            localStorage.setItem(`userProfile_${authData.user.id}`, JSON.stringify({
              id: authData.user.id,
              email: authData.user.email,
              role,
              name
            }));
          } catch (profileError: any) {
            console.error("Erreur lors de la création du profil:", profileError);
            console.error("Détails:", profileError.details, profileError.hint);
          }
          
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
      } catch (signUpError: any) {
        console.error("Exception lors de l'inscription:", signUpError);
        
        if (signUpError.message === "Failed to fetch" || 
            signUpError.name === "TypeError" || 
            signUpError.message?.includes("network") ||
            signUpError.message?.includes("ERR_NAME_NOT_RESOLVED")) {
          return {
            success: false,
            error: {
              message: "Problème de connexion à notre serveur. Veuillez vérifier votre connexion internet et réessayer.",
              status: 0,
              isRetryable: true,
              isNetworkError: true
            }
          };
        }
        
        return {
          success: false,
          error: {
            message: `Exception: ${signUpError.message || "Erreur inconnue"}`,
            status: 500,
            isRetryable: true
          }
        };
      }
    } catch (error: any) {
      console.error("Erreur d'inscription (générale):", error);
      
      if (error.message === "Failed to fetch" || 
          error.name === "TypeError" || 
          error.message?.includes("network") ||
          error.message?.includes("ERR_NAME_NOT_RESOLVED")) {
        
        toast.error("Problème de connexion", {
          description: "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet."
        });
        
        return {
          success: false,
          error: {
            message: "Problème de connexion à notre serveur. Veuillez vérifier votre connexion internet et réessayer.",
            status: 0,
            isRetryable: true,
            isNetworkError: true
          }
        };
      }
      
      const message = error.message?.includes("already registered") 
        ? "Cette adresse email est déjà utilisée"
        : `Une erreur est survenue lors de l'inscription: ${error.message || "Erreur inconnue"}`;
      
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

  async signIn({ email, password }: SignInData) {
    try {
      console.log("Attempting to sign in with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase auth error:", error);
        
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Veuillez confirmer votre email avant de vous connecter");
        }
        
        // Handle invalid credentials more explicitly
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email ou mot de passe incorrect");
        }
        
        throw error;
      }
      
      console.log("Sign in successful, user:", data.user);
      
      if (data.user) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (userError) {
            console.warn("Error checking user data after login:", userError);
          }
            
          if (!userData && !userError) {
            const storedProfileData = localStorage.getItem(`userProfile_${data.user.id}`);
            
            if (storedProfileData) {
              await this.createProfileAfterConfirmation(data.user.id);
            }
          }
        } catch (profileError) {
          console.error("Error checking/creating profile after login:", profileError);
          // Continue with login anyway, don't block the user
        }
      }
      
      toast.success("Connexion réussie", {
        description: `Bienvenue, ${data.user.user_metadata?.name || data.user.email}`
      });
      
      return { user: data.user };
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      
      let message = "Identifiants incorrects";
      
      // More specific error handling
      if (error.message?.includes("Invalid login credentials") || 
          error.message?.includes("mot de passe incorrect")) {
        message = "Email ou mot de passe incorrect";
      } else if (error.message?.includes("Email not confirmed") || 
                error.message?.includes("confirmer votre email")) {
        message = "Veuillez confirmer votre email avant de vous connecter";
      } else if (error.message === "Failed to fetch" || 
                error.name === "TypeError" || 
                error.message?.includes("network")) {
        message = "Problème de connexion au serveur. Veuillez vérifier votre connexion internet.";
      }
      
      toast.error("Échec de connexion", {
        description: message
      });
      
      throw new Error(message);
    }
  },

  async resendConfirmationEmail(email: string) {
    try {
      const origin = window.location.origin;
      const redirectUrl = `${origin}/email-confirmation`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl
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
  
  async uploadAvatar(file: File, userId: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicURL } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      return publicURL.publicUrl;
    } catch (error) {
      console.error("Erreur lors de l'upload de l'avatar:", error);
      throw error;
    }
  },
  
  async deleteAvatar(avatarUrl: string) {
    try {
      const urlParts = avatarUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('profiles') + 1).join('/');
      
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
      
      const result = await createUserProfile({
        id: userId,
        email: profileData.email,
        role: profileData.role,
        name: profileData.name
      });
      
      if (result.success) {
        localStorage.removeItem(`userProfile_${userId}`);
      }
      
      return result;
    } catch (error: any) {
      console.error('Erreur lors de la création du profil après confirmation:', error);
      return {
        success: false,
        error: {
          message: error.message || "Erreur lors de la création du profil",
          status: 500,
          isRetryable: true
        }
      };
    }
  }
};
