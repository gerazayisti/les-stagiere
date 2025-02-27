
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  role: 'stagiaire' | 'entreprise' | 'admin';
  email_confirmed_at?: string;
  user_metadata?: any;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier la session actuelle
    checkUser();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session?.user);
      if (session?.user) {
        const role = session.user.user_metadata?.role;
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: role,
          email_confirmed_at: session.user.email_confirmed_at,
          user_metadata: session.user.user_metadata
        });
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      console.log("Current session:", session);

      if (session?.user) {
        const role = session.user.user_metadata?.role;
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: role,
          email_confirmed_at: session.user.email_confirmed_at,
          user_metadata: session.user.user_metadata
        });
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      toast("Impossible de vérifier votre session", {
        description: "Une erreur est survenue lors de la vérification de votre session",
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("Tentative de déconnexion...");
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // S'assurer que l'état est bien mis à jour
      setUser(null);
      setUserRole(null);
      console.log("Déconnexion réussie");
      
      // Naviguer vers la page d'accueil
      navigate('/');
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast("Impossible de vous déconnecter", {
        description: "Une erreur est survenue lors de la déconnexion",
        position: "top-center"
      });
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
    isAuthenticated: !!user,
    isEmailVerified: !!user?.email_confirmed_at,
    refreshUser: checkUser
  };
}
