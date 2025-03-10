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
    
    // Vérifier d'abord si l'utilisateur existe déjà dans la table users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .maybeSingle();
      
    if (checkError) {
      console.error("Erreur lors de la vérification de l'existence de l'utilisateur:", checkError);
      return { success: false, error: checkError };
    }
    
    if (existingUser) {
      console.log("L'utilisateur existe déjà dans la table users, pas besoin de le créer à nouveau");
      return { success: true };
    }
    
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
      // Vérifier si le stagiaire existe déjà
      const { data: existingStagiaire, error: checkStagiaireError } = await supabase
        .from('stagiaires')
        .select('id')
        .eq('id', id)
        .maybeSingle();
        
      if (checkStagiaireError) {
        console.error("Erreur lors de la vérification de l'existence du stagiaire:", checkStagiaireError);
      }
      
      if (existingStagiaire) {
        console.log("Le stagiaire existe déjà, pas besoin de le créer à nouveau");
        return { success: true };
      }
      
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
      // Vérifier si l'entreprise existe déjà
      const { data: existingEntreprise, error: checkEntrepriseError } = await supabase
        .from('entreprises')
        .select('id')
        .eq('id', id)
        .maybeSingle();
        
      if (checkEntrepriseError) {
        console.error("Erreur lors de la vérification de l'existence de l'entreprise:", checkEntrepriseError);
      }
      
      if (existingEntreprise) {
        console.log("L'entreprise existe déjà, pas besoin de la créer à nouveau");
        return { success: true };
      }
      
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
      
      // 2. Vérifier si l'email existe déjà dans auth
      const { data: authUserData, error: checkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (authUserData?.user) {
        throw new Error("Cette adresse email est déjà utilisée");
      }
      
      // 3. Inscription via Supabase Auth avec redirection pour confirmation d'email
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, name },
          emailRedirectTo: `${window.location.origin}/email-confirmation`
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

      // 4. Si l'utilisateur est créé avec succès dans Auth, créer immédiatement le profil
      if (authData?.user) {
        try {
          // Créer immédiatement le profil utilisateur
          const userProfileResult = await createUserProfile({
            id: authData.user.id,
            email: authData.user.email || email,
            role,
            name
          });
          
          if (!userProfileResult.success) {
            console.error("L'utilisateur a été créé dans auth mais pas dans les tables publiques", userProfileResult.error);
            
            // Si l'erreur est critique, on peut l'escalader
            if (userProfileResult.error && 'code' in userProfileResult.error && userProfileResult.error.code === '23505') {
              // C'est une violation de contrainte d'unicité, mais l'utilisateur est créé dans auth
              console.warn("Conflit de clé unique lors de la création du profil, mais l'utilisateur est créé dans auth");
            }
          } else {
            console.log("Profil utilisateur créé avec succès dans les tables publiques");
          }
        } catch (profileError: any) {
          console.error("Erreur lors de la création du profil:", profileError);
          
          // Si l'erreur est liée à une contrainte d'unicité (email déjà utilisé), on le signale
          if (profileError && 'code' in profileError && profileError.code === '23505') {
            console.warn("Ce profil existe déjà dans la base de données, mais l'utilisateur est créé dans auth");
          }
          
          // Pour les autres erreurs, on continue le processus car l'utilisateur est créé dans auth
          // Il pourra compléter son profil plus tard
        }
      }
      
      toast.success("Inscription réussie", {
        description: "Vérifiez votre email pour confirmer votre compte"
      });
      
      return { success: true, data: authData };
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      
      let message = "Une erreur est survenue lors de l'inscription";
      
      if (error.message?.includes("already registered") || error.message?.includes("déjà utilisée")) {
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

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Veuillez confirmer votre email avant de vous connecter");
        }
        throw error;
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
  }
};
