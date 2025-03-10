import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { auth } from '@/lib/auth';
import { User } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fonction pour convertir les données d'utilisateur Supabase en notre modèle User
  const formatUserData = useCallback(async (supabaseUser: any): Promise<User | null> => {
    if (!supabaseUser) return null;
    
    console.log("Formatage de l'utilisateur:", supabaseUser);
    
    // Vérifier si l'utilisateur a un profil dans la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', supabaseUser.id)
      .maybeSingle();
    
    if (userError) {
      console.error("Erreur lors de la récupération du profil utilisateur:", userError);
    }
    
    // Si l'utilisateur n'a pas encore de profil, utiliser les données de user_metadata
    const role = userData?.role || supabaseUser.user_metadata?.role || null;
    const name = userData?.name || supabaseUser.user_metadata?.name || '';
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      role: role || 'stagiaire',
      name: name,
      email_confirmed_at: supabaseUser.email_confirmed_at,
      user_metadata: supabaseUser.user_metadata
    };
  }, []);

  // Vérifier la session actuelle
  const checkUser = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session?.user) {
        const formattedUser = await formatUserData(session.user);
        setUser(formattedUser);
        setUserRole(formattedUser?.role || null);
      } else {
        setUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  }, [formatUserData]);

  // Méthode pour rafraîchir manuellement les données utilisateur
  const refreshUser = useCallback(async () => {
    return checkUser();
  }, [checkUser]);

  // Effet pour initialiser l'état d'authentification
  useEffect(() => {
    // Vérifier la session actuelle au montage
    checkUser();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user);
      
      if (event === 'SIGNED_OUT') {
        console.log("Utilisateur déconnecté, nettoyage de l'état...");
        setUser(null);
        setUserRole(null);
      } else if (session?.user) {
        const formattedUser = await formatUserData(session.user);
        setUser(formattedUser);
        setUserRole(formattedUser?.role || null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log("Nettoyage du listener d'authentification");
      subscription.unsubscribe();
    };
  }, [checkUser, formatUserData]);

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setUserRole(null);
      
      navigate('/');
      
      toast.success("Vous avez été déconnecté avec succès");
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error("Impossible de vous déconnecter");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    userRole,
    loading,
    signOut,
    refreshUser,
    isAuthenticated: !!user,
    isEmailVerified: !!user?.email_confirmed_at
  };
}
