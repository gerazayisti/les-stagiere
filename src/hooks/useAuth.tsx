
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

  // Optimized function to convert Supabase user data to our User model
  const formatUserData = useCallback(async (supabaseUser: any): Promise<User | null> => {
    if (!supabaseUser) return null;
    
    // Check for cached user data to avoid unnecessary database calls
    const cachedUserData = localStorage.getItem(`cachedUserProfile_${supabaseUser.id}`);
    if (cachedUserData) {
      const parsedData = JSON.parse(cachedUserData);
      const cacheAge = Date.now() - parsedData.timestamp;
      
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 300000) {
        console.log("Using cached user profile data");
        return parsedData.user;
      }
    }
    
    // No valid cache, fetch from database
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      
      if (userError) {
        console.error("Erreur lors de la récupération du profil utilisateur:", userError);
      }
      
      // Use user data from DB or fallback to metadata
      const role = userData?.role || supabaseUser.user_metadata?.role || 'stagiaire';
      const name = userData?.name || supabaseUser.user_metadata?.name || '';
      
      const formattedUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: role,
        name: name,
        email_confirmed_at: supabaseUser.email_confirmed_at,
        user_metadata: supabaseUser.user_metadata
      };
      
      // Cache the user data
      localStorage.setItem(`cachedUserProfile_${supabaseUser.id}`, JSON.stringify({
        user: formattedUser,
        timestamp: Date.now()
      }));
      
      return formattedUser;
    } catch (error) {
      console.error("Erreur lors de la récupération des données utilisateur:", error);
      
      // Fallback to basic user data without DB fields
      const basicUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: supabaseUser.user_metadata?.role || 'stagiaire',
        name: supabaseUser.user_metadata?.name || '',
        email_confirmed_at: supabaseUser.email_confirmed_at,
        user_metadata: supabaseUser.user_metadata
      };
      
      return basicUser;
    }
  }, []);

  // Check current session with optimized loading
  const checkUser = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session?.user) {
        // Start with setting basic user data from session to show UI faster
        const basicUserData = {
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata?.role || 'stagiaire',
          name: session.user.user_metadata?.name || '',
          email_confirmed_at: session.user.email_confirmed_at,
          user_metadata: session.user.user_metadata
        };
        
        // Set initial user state with basic data for faster UI rendering
        setUser(basicUserData);
        setUserRole(basicUserData.role);
        setLoading(false);
        
        // Then fetch complete user data in background
        const formattedUser = await formatUserData(session.user);
        if (formattedUser) {
          setUser(formattedUser);
          setUserRole(formattedUser.role);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      setUser(null);
      setUserRole(null);
      setLoading(false);
    }
  }, [formatUserData]);

  // Method to manually refresh user data
  const refreshUser = useCallback(async () => {
    return checkUser();
  }, [checkUser]);

  // Effect to initialize authentication state
  useEffect(() => {
    // Check current session on mount
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        localStorage.removeItem(`cachedUserProfile_${session?.user?.id}`);
      } else if (session?.user) {
        // Set basic user data immediately for faster UI rendering
        const basicUserData = {
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata?.role || 'stagiaire',
          name: session.user.user_metadata?.name || '',
          email_confirmed_at: session.user.email_confirmed_at,
          user_metadata: session.user.user_metadata
        };
        
        setUser(basicUserData);
        setUserRole(basicUserData.role);
        
        // Then fetch complete user data in background
        const formattedUser = await formatUserData(session.user);
        if (formattedUser) {
          setUser(formattedUser);
          setUserRole(formattedUser.role);
        }
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUser, formatUserData]);

  // Logout function
  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clean up cached user data
      if (user) {
        localStorage.removeItem(`cachedUserProfile_${user.id}`);
      }
      
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
