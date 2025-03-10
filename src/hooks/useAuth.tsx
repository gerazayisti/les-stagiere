
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { auth } from '@/lib/auth';
import { User } from '@/types/auth';

// Utilisé pour le cache global de session
const SESSION_CACHE_KEY = 'app_session_cache';
const USER_CACHE_PREFIX = 'cachedUserProfile_';
const SESSION_CACHE_DURATION = 1000 * 60 * 60; // 1 heure

// Fonction utilitaire pour récupérer des données mises en cache
const getFromCache = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    const parsedData = JSON.parse(data);
    const now = Date.now();
    
    // Vérifier si les données sont expirées
    if (parsedData.expiry && parsedData.expiry < now) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsedData.data;
  } catch (e) {
    console.error('Erreur lors de la récupération du cache:', e);
    return null;
  }
};

// Fonction utilitaire pour mettre en cache des données
const setInCache = (key: string, data: any, duration: number = SESSION_CACHE_DURATION) => {
  try {
    const expiry = Date.now() + duration;
    localStorage.setItem(key, JSON.stringify({ data, expiry }));
  } catch (e) {
    console.error('Erreur lors de la mise en cache:', e);
  }
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Optimized function to convert Supabase user data to our User model
  const formatUserData = useCallback(async (supabaseUser: any): Promise<User | null> => {
    if (!supabaseUser) return null;
    
    // Check for cached user data to avoid unnecessary database calls
    const cachedUserData = getFromCache(`${USER_CACHE_PREFIX}${supabaseUser.id}`);
    if (cachedUserData) {
      console.log("Using cached user profile data");
      return cachedUserData;
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
      setInCache(`${USER_CACHE_PREFIX}${supabaseUser.id}`, formattedUser);
      
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
      // D'abord, essayer de récupérer l'utilisateur à partir du cache de session
      const cachedSession = getFromCache(SESSION_CACHE_KEY);
      if (cachedSession && cachedSession.user) {
        console.log("Using cached session");
        setUser(cachedSession.user);
        setUserRole(cachedSession.user.role);
        
        // Continue to fetch latest session in background 
        // pour maintenir à jour le cache de session
        fetchRealSession();
        return;
      }
      
      await fetchRealSession();
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      setUser(null);
      setUserRole(null);
      setLoading(false);
    }
  }, [formatUserData]);
  
  // Fonction qui récupère la session réelle depuis Supabase
  const fetchRealSession = async () => {
    try {
      setLoading(true);
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
        
        // Cache basic session data immediately
        setInCache(SESSION_CACHE_KEY, { user: basicUserData });
        
        // Then fetch complete user data in background
        const formattedUser = await formatUserData(session.user);
        if (formattedUser) {
          setUser(formattedUser);
          setUserRole(formattedUser.role);
          
          // Update cache with full user data
          setInCache(SESSION_CACHE_KEY, { user: formattedUser });
        }
      } else {
        setUser(null);
        setUserRole(null);
        localStorage.removeItem(SESSION_CACHE_KEY);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

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
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        localStorage.removeItem(SESSION_CACHE_KEY);
        if (session?.user) {
          localStorage.removeItem(`${USER_CACHE_PREFIX}${session.user.id}`);
        }
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
        
        // Cache basic session data immediately
        setInCache(SESSION_CACHE_KEY, { user: basicUserData });
        
        // Then fetch complete user data in background
        const formattedUser = await formatUserData(session.user);
        if (formattedUser) {
          setUser(formattedUser);
          setUserRole(formattedUser.role);
          
          // Update cache with full user data
          setInCache(SESSION_CACHE_KEY, { user: formattedUser });
        }
      }
      
      setLoading(false);
    });

    return () => {
      console.log("Nettoyage du listener d'authentification");
      subscription.unsubscribe();
    };
  }, [checkUser, formatUserData]);

  // Logout function
  const signOut = async () => {
    try {
      setLoading(true);
      
      const currentUserId = user?.id;
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clean up cached user data
      if (currentUserId) {
        localStorage.removeItem(`${USER_CACHE_PREFIX}${currentUserId}`);
      }
      localStorage.removeItem(SESSION_CACHE_KEY);
      
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
