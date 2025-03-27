import { supabase } from './supabase';
import { toast } from 'sonner';
import { AuthError, AuthResponse, SignInData, SignUpData, SupabaseAuthError, User } from '@/types/auth';

export type UserRole = 'stagiaire' | 'entreprise' | 'admin';

async function checkEmailExists(email: string): Promise<boolean> {
  try {
    // Vérification dans la table users
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();
      
    if (userData) return true;
    
    // Nous ne pouvons pas facilement vérifier dans auth.users via l'API
    // car listUsers ne permet pas de filtrer par email
    // Nous allons donc nous fier uniquement à la vérification dans la table users
    
    return false;
  } catch (error) {
    console.error(`Erreur lors de la vérification de l'email:`, error);
    // En cas d'erreur, on renvoie false pour permettre à l'utilisateur de continuer
    // Les vérifications ultérieures dans le processus d'inscription détecteront les doublons
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
      try {
        // Récupérer la structure actuelle de la table stagiaires
        const { data: tableInfo, error: tableError } = await supabase
          .from('stagiaires')
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.error("Erreur lors de la récupération de la structure de la table stagiaires:", tableError);
        }
        
        // Construire un objet avec seulement les champs valides
        const stagiaireData: any = {
          id: id,
          name,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&size=128&background=random&format=.png`,
          is_verified: false,
          bio: `${name} est à la recherche d'un stage.`
        };
        
        // Ajouter des champs optionnels s'ils existent dans la table
        if (!tableError && tableInfo && tableInfo.length > 0) {
          const sampleRow = tableInfo[0];
          if ('skills' in sampleRow) stagiaireData.skills = [];
          if ('languages' in sampleRow) stagiaireData.languages = [];
          if ('social_links' in sampleRow) stagiaireData.social_links = {};
          if ('is_premium' in sampleRow) stagiaireData.is_premium = false;
          if ('disponibility' in sampleRow) stagiaireData.disponibility = "upcoming";
          if ('education' in sampleRow) stagiaireData.education = [];
          if ('created_at' in sampleRow) stagiaireData.created_at = new Date().toISOString();
        }
        
        console.log("Tentative d'insertion dans stagiaires avec les données:", stagiaireData);
        
        const { error: stagiaireError } = await supabase
          .from('stagiaires')
          .upsert(stagiaireData, { onConflict: 'id' });
        
        if (stagiaireError) {
          console.error("Error creating intern profile:", stagiaireError);
          console.error("Error details:", stagiaireError.details, stagiaireError.hint, stagiaireError.message);
          throw stagiaireError;
        }
      } catch (error) {
        console.error("Exception lors de la création du profil stagiaire:", error);
        // Continuer malgré l'erreur pour que l'utilisateur puisse au moins se connecter
      }
    } 
    else if (role === 'entreprise') {
      try {
        // Récupérer la structure actuelle de la table entreprises
        const { data: tableInfo, error: tableError } = await supabase
          .from('entreprises')
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.error("Erreur lors de la récupération de la structure de la table entreprises:", tableError);
        }
        
        // Construire un objet avec seulement les champs valides
        const entrepriseData: any = {
          id: id,
          name,
          email,
          logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&size=128&background=random&format=.png`,
          is_verified: false,
          description: `${name} est une entreprise qui recherche des stagiaires.`
        };
        
        // Ajouter des champs optionnels s'ils existent dans la table
        if (!tableError && tableInfo && tableInfo.length > 0) {
          const sampleRow = tableInfo[0];
          if ('industry' in sampleRow) entrepriseData.industry = '';
          if ('location' in sampleRow) entrepriseData.location = '';
          if ('website' in sampleRow) entrepriseData.website = '';
          if ('created_at' in sampleRow) entrepriseData.created_at = new Date().toISOString();
        }
        
        console.log("Tentative d'insertion dans entreprises avec les données:", entrepriseData);
        
        const { error: entrepriseError } = await supabase
          .from('entreprises')
          .upsert(entrepriseData, { onConflict: 'id' });
        
        if (entrepriseError) {
          console.error("Error creating company profile:", entrepriseError);
          console.error("Error details:", entrepriseError.details, entrepriseError.hint, entrepriseError.message);
          throw entrepriseError;
        }
      } catch (error) {
        console.error("Exception lors de la création du profil entreprise:", error);
        // Continuer malgré l'erreur pour que l'utilisateur puisse au moins se connecter
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
      
      // Vérification plus stricte de l'email
      try {
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
          console.log("Email déjà utilisé détecté lors de la vérification préalable:", email);
          return {
            success: false,
            error: {
              message: "Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser la récupération de mot de passe.",
              status: 409,
              isRetryable: false
            }
          };
        }
      } catch (emailCheckError) {
        console.warn("Erreur lors de la vérification d'email:", emailCheckError);
        // Ne pas continuer si on ne peut pas vérifier l'email
        return {
          success: false,
          error: {
            message: "Impossible de vérifier la disponibilité de l'email. Veuillez réessayer.",
            status: 500,
            isRetryable: true
          }
        };
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
          
          if (signUpError.message?.includes("already registered") || 
              signUpError.message?.includes("already exists") ||
              signUpError.message?.includes("duplicate key") ||
              signUpError.status === 409) {
            return {
              success: false,
              error: {
                message: "Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser la récupération de mot de passe.",
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
            // Vérifier à nouveau si l'utilisateur existe déjà avant d'insérer
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('email', email)
              .maybeSingle();
              
            if (existingUser) {
              console.log("Utilisateur déjà existant détecté avant insertion:", email);
              return {
                success: true,
                data: authData
              };
            }
            
            await supabase.from('users').upsert({
              id: authData.user.id,
              email: email,
              role: role,
              name: name,
              is_active: true
            }, { onConflict: 'id' });
            
            if (role === 'stagiaire') {
              try {
                // Récupérer la structure actuelle de la table stagiaires
                const { data: tableInfo, error: tableError } = await supabase
                  .from('stagiaires')
                  .select('*')
                  .limit(1);
                
                if (tableError) {
                  console.error("Erreur lors de la récupération de la structure de la table stagiaires:", tableError);
                }
                
                // Construire un objet avec seulement les champs valides
                const stagiaireData: any = {
                  id: authData.user.id,
                  name,
                  email,
                  avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&size=128&background=random&format=.png`,
                  is_verified: false,
                  bio: `${name} est à la recherche d'un stage.`
                };
                
                // Ajouter des champs optionnels s'ils existent dans la table
                if (!tableError && tableInfo && tableInfo.length > 0) {
                  const sampleRow = tableInfo[0];
                  if ('skills' in sampleRow) stagiaireData.skills = [];
                  if ('languages' in sampleRow) stagiaireData.languages = [];
                  if ('social_links' in sampleRow) stagiaireData.social_links = {};
                  if ('is_premium' in sampleRow) stagiaireData.is_premium = false;
                  if ('disponibility' in sampleRow) stagiaireData.disponibility = "upcoming";
                  if ('education' in sampleRow) stagiaireData.education = [];
                  if ('created_at' in sampleRow) stagiaireData.created_at = new Date().toISOString();
                }
                
                console.log("Tentative d'insertion dans stagiaires avec les données:", stagiaireData);
                
                const { error: stagiaireError } = await supabase
                  .from('stagiaires')
                  .upsert(stagiaireData, { onConflict: 'id' });
                
                if (stagiaireError) {
                  console.error("Error creating intern profile:", stagiaireError);
                  console.error("Error details:", stagiaireError.details, stagiaireError.hint, stagiaireError.message);
                  throw stagiaireError;
                }
              } catch (error) {
                console.error("Exception lors de la création du profil stagiaire:", error);
                // Continuer malgré l'erreur pour que l'utilisateur puisse au moins se connecter
              }
            } else if (role === 'entreprise') {
              try {
                // Récupérer la structure actuelle de la table entreprises
                const { data: tableInfo, error: tableError } = await supabase
                  .from('entreprises')
                  .select('*')
                  .limit(1);
                
                if (tableError) {
                  console.error("Erreur lors de la récupération de la structure de la table entreprises:", tableError);
                }
                
                // Construire un objet avec seulement les champs valides
                const entrepriseData: any = {
                  id: authData.user.id,
                  name,
                  email,
                  logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&size=128&background=random&format=.png`,
                  is_verified: false,
                  description: `${name} est une entreprise qui recherche des stagiaires.`
                };
                
                // Ajouter des champs optionnels s'ils existent dans la table
                if (!tableError && tableInfo && tableInfo.length > 0) {
                  const sampleRow = tableInfo[0];
                  if ('industry' in sampleRow) entrepriseData.industry = '';
                  if ('location' in sampleRow) entrepriseData.location = '';
                  if ('website' in sampleRow) entrepriseData.website = '';
                  if ('created_at' in sampleRow) entrepriseData.created_at = new Date().toISOString();
                }
                
                console.log("Tentative d'insertion dans entreprises avec les données:", entrepriseData);
                
                const { error: entrepriseError } = await supabase
                  .from('entreprises')
                  .upsert(entrepriseData, { onConflict: 'id' });
                
                if (entrepriseError) {
                  console.error("Error creating company profile:", entrepriseError);
                  console.error("Error details:", entrepriseError.details, entrepriseError.hint, entrepriseError.message);
                  throw entrepriseError;
                }
              } catch (error) {
                console.error("Exception lors de la création du profil entreprise:", error);
                // Continuer malgré l'erreur pour que l'utilisateur puisse au moins se connecter
              }
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
        
        // Gestion spécifique des erreurs de clé dupliquée
        if (signUpError.code === '23505' || 
            (signUpError.message && signUpError.message.includes("duplicate key"))) {
          return {
            success: false,
            error: {
              message: "Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser la récupération de mot de passe.",
              status: 409,
              isRetryable: false
            }
          };
        }
        
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
      
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (!userData && !userError) {
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
      console.log("Création de profil après confirmation pour:", profileData);
      
      try {
        // D'abord, insérer dans la table users
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: profileData.email,
            role: profileData.role,
            name: profileData.name,
            is_active: true
          }, { onConflict: 'id' });

        if (userError) {
          console.error("Erreur lors de l'insertion dans users:", userError);
          if (userError.code === '23505') {
            console.log("L'utilisateur existe déjà, on continue...");
          } else {
            throw userError;
          }
        }
        
        // Ensuite, créer le profil spécifique selon le rôle
        if (profileData.role === 'stagiaire') {
          try {
            // Récupérer la structure actuelle de la table stagiaires
            const { data: tableInfo, error: tableError } = await supabase
              .from('stagiaires')
              .select('*')
              .limit(1);
            
            if (tableError) {
              console.error("Erreur lors de la récupération de la structure de la table stagiaires:", tableError);
            }
            
            // Construire un objet avec seulement les champs valides
            const stagiaireData: any = {
              id: userId,
              name: profileData.name,
              email: profileData.email,
              avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name.charAt(0))}&size=128&background=random&format=.png`,
              is_verified: false,
              bio: `${profileData.name} est à la recherche d'un stage.`
            };
            
            // Ajouter des champs optionnels s'ils existent dans la table
            if (!tableError && tableInfo && tableInfo.length > 0) {
              const sampleRow = tableInfo[0];
              if ('skills' in sampleRow) stagiaireData.skills = [];
              if ('languages' in sampleRow) stagiaireData.languages = [];
              if ('social_links' in sampleRow) stagiaireData.social_links = {};
              if ('is_premium' in sampleRow) stagiaireData.is_premium = false;
              if ('disponibility' in sampleRow) stagiaireData.disponibility = "upcoming";
              if ('education' in sampleRow) stagiaireData.education = [];
              if ('created_at' in sampleRow) stagiaireData.created_at = new Date().toISOString();
            }
            
            console.log("Tentative d'insertion dans stagiaires avec les données:", stagiaireData);
            
            const { error: stagiaireError } = await supabase
              .from('stagiaires')
              .upsert(stagiaireData, { onConflict: 'id' });
            
            if (stagiaireError) {
              console.error("Error creating intern profile:", stagiaireError);
              console.error("Error details:", stagiaireError.details, stagiaireError.hint, stagiaireError.message);
              throw stagiaireError;
            }
          } catch (error) {
            console.error("Exception lors de la création du profil stagiaire:", error);
            // Continuer malgré l'erreur pour que l'utilisateur puisse au moins se connecter
          }
        } else if (profileData.role === 'entreprise') {
          try {
            // Récupérer la structure actuelle de la table entreprises
            const { data: tableInfo, error: tableError } = await supabase
              .from('entreprises')
              .select('*')
              .limit(1);
            
            if (tableError) {
              console.error("Erreur lors de la récupération de la structure de la table entreprises:", tableError);
            }
            
            // Construire un objet avec seulement les champs valides
            const entrepriseData: any = {
              id: userId,
              name: profileData.name,
              email: profileData.email,
              logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name.charAt(0))}&size=128&background=random&format=.png`,
              is_verified: false,
              description: `${profileData.name} est une entreprise qui recherche des stagiaires.`
            };
            
            // Ajouter des champs optionnels s'ils existent dans la table
            if (!tableError && tableInfo && tableInfo.length > 0) {
              const sampleRow = tableInfo[0];
              if ('industry' in sampleRow) entrepriseData.industry = '';
              if ('location' in sampleRow) entrepriseData.location = '';
              if ('website' in sampleRow) entrepriseData.website = '';
              if ('created_at' in sampleRow) entrepriseData.created_at = new Date().toISOString();
            }
            
            console.log("Tentative d'insertion dans entreprises avec les données:", entrepriseData);
            
            const { error: entrepriseError } = await supabase
              .from('entreprises')
              .upsert(entrepriseData, { onConflict: 'id' });
            
            if (entrepriseError) {
              console.error("Error creating company profile:", entrepriseError);
              console.error("Error details:", entrepriseError.details, entrepriseError.hint, entrepriseError.message);
              throw entrepriseError;
            }
          } catch (error) {
            console.error("Exception lors de la création du profil entreprise:", error);
            // Continuer malgré l'erreur pour que l'utilisateur puisse au moins se connecter
          }
        }
        
        localStorage.removeItem(`userProfile_${userId}`);
        return { success: true };
      } catch (error: any) {
        console.error('Erreur lors de la création du profil après confirmation:', error);
        return {
          success: false,
          error: {
            message: error.message || "Erreur lors de la création du profil",
            status: error.code === '23505' ? 409 : 500,
            isRetryable: true
          }
        };
      }
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
