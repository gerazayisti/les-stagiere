
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function EmailConfirmation() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [progress, setProgress] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Fonction d'extraction de token plus robuste
  const extractAccessToken = useCallback(() => {
    // Vérifier le hash URL (format standard Supabase)
    if (location.hash) {
      const match = location.hash.match(/access_token=([^&]*)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Vérifier les paramètres de requête
    const searchParams = new URLSearchParams(location.search);
    const queryToken = searchParams.get('access_token');
    if (queryToken) {
      return queryToken;
    }
    
    return null;
  }, [location.hash, location.search]);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        if (loading === false) return; // Prevent rerunning if already completed
        
        setProgress(5);
        
        // Utiliser notre fonction d'extraction de token plus robuste
        const accessToken = extractAccessToken();
        
        console.log("Email confirmation - URL details:", { 
          hash: location.hash, 
          search: location.search,
          pathname: location.pathname,
          token: accessToken ? "Found" : "Not found"
        });
        
        if (!accessToken) {
          console.error('No access token found in URL');
          
          // Vérifier les erreurs dans le hash
          const errorMatch = location.hash.match(/error=([^&]*)/);
          const errorMsgMatch = location.hash.match(/error_description=([^&]*)/);
          
          if (errorMatch && errorMatch[1]) {
            const errorDescription = errorMsgMatch && errorMsgMatch[1] 
              ? decodeURIComponent(errorMsgMatch[1])
              : 'Erreur lors de la confirmation';
              
            throw new Error(`${decodeURIComponent(errorMatch[1])}: ${errorDescription}`);
          }
          
          // Si nous n'avons pas de token, mais que nous sommes sur la page de confirmation,
          // essayons de vérifier si l'utilisateur est déjà authentifié
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            // L'utilisateur est déjà authentifié, rediriger vers son profil
            const user = data.session.user;
            const role = user.user_metadata?.role || 'stagiaire';
            
            if (role === 'entreprise') {
              navigate(`/entreprises/${user.id}`, { replace: true });
              return;
            } else if (role === 'stagiaire') {
              navigate(`/stagiaires/${user.id}`, { replace: true });
              return;
            } else {
              navigate('/complete-profile', { replace: true });
              return;
            }
          }
          
          throw new Error('Lien de confirmation invalide. Veuillez réessayer ou contacter le support.');
        }

        setStatus('processing');
        setProgress(20);
        
        try {
          // Obtenir les informations utilisateur à partir du token
          const { data: { user }, error: sessionError } = await supabase.auth.getUser(accessToken);

          if (sessionError || !user) {
            console.error('User session error:', sessionError);
            throw sessionError || new Error('Utilisateur non trouvé');
          }
          
          setProgress(40);
          
          // Extraire les métadonnées utilisateur
          const role = user.user_metadata?.role || 'stagiaire';
          const name = user.user_metadata?.name || 'Utilisateur';
          
          console.log("User data retrieved:", { 
            id: user.id, 
            email: user.email,
            role, 
            name,
            metadata: user.user_metadata
          });
          
          try {
            // Création ou mise à jour de l'enregistrement utilisateur
            const { error: userError } = await supabase
              .from('users')
              .upsert({
                id: user.id,
                email: user.email,
                role: role,
                name: name,
                is_active: true
              }, { onConflict: 'id' });
              
            if (userError) {
              console.error("Error creating user record:", userError);
            }
          } catch (profileError) {
            console.error("Profile update error:", profileError);
            // Continue with redirect even if profile update fails
          }
          
          setProgress(60);
          
          // Chemin de redirection avec options de secours
          let redirectPath = '/';
          
          try {
            // Exécuter les créations de profil en parallèle pour de meilleures performances
            if (role === 'entreprise') {
              const { error: enterpriseError } = await supabase
                .from('entreprises')
                .upsert({
                  id: user.id,
                  name: name,
                  email: user.email,
                  logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&size=128&background=random&format=.png`,
                  is_verified: false,
                  description: `${name} est une entreprise qui recherche des stagiaires.`,
                  created_at: new Date().toISOString(),
                  industry: '',
                  location: '',
                  website: ''
                }, { onConflict: 'id' });
                
              if (enterpriseError) {
                console.error("Error creating enterprise profile:", enterpriseError);
              }
                
              redirectPath = `/entreprises/${user.id}`;
            } 
            else if (role === 'stagiaire') {
              const { error: stagiaireError } = await supabase
                .from('stagiaires')
                .upsert({
                  id: user.id,
                  name: name,
                  email: user.email,
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
                
              if (stagiaireError) {
                console.error("Error creating intern profile:", stagiaireError);
                console.error("Error details:", stagiaireError.details, stagiaireError.hint, stagiaireError.message);
              }
                
              redirectPath = `/stagiaires/${user.id}`;
            } 
            else {
              redirectPath = '/complete-profile';
            }
          } catch (profileCreationError) {
            console.error("Profile creation error:", profileCreationError);
            // Default to /complete-profile if profile creation fails
            redirectPath = '/complete-profile';
          }

          console.log("Will redirect to:", redirectPath);
          setProgress(80);
          setStatus('success');
          toast.success('Email confirmé avec succès');
          
          // Mettre en cache les informations utilisateur pour un chargement plus rapide
          try {
            localStorage.setItem(`cachedUserProfile_${user.id}`, JSON.stringify({
              data: {
                id: user.id,
                email: user.email,
                role: role,
                name: name, 
                email_confirmed_at: user.email_confirmed_at,
                user_metadata: user.user_metadata
              },
              timestamp: Date.now()
            }));
            
            // Mettre en cache l'état de navigation pour un retour visuel immédiat de l'interface
            localStorage.setItem('navigation_state', JSON.stringify({ 
              user: {
                id: user.id,
                email: user.email,
                role: role,
                name: name, 
                email_confirmed_at: user.email_confirmed_at,
                user_metadata: user.user_metadata
              }, 
              userRole: role,
              timestamp: Date.now()
            }));
          } catch (cacheError) {
            console.error("Cache error:", cacheError);
            // Continue even if caching fails
          }
          
          setProgress(100);
          
          // Court délai pour assurer que le toast est vu
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 500);
        } catch (userDataError) {
          console.error("User data processing error:", userDataError);
          throw new Error("Erreur lors du traitement des données utilisateur");
        }
      } catch (error: any) {
        console.error('Erreur lors de la confirmation de l\'email:', error);
        setStatus('error');
        toast.error(error.message || 'Erreur lors de la confirmation de l\'email');
        
        // Stocker l'erreur dans le sessionStorage
        try {
          sessionStorage.setItem('auth_error', JSON.stringify({
            message: error.message || 'Erreur lors de la confirmation de l\'email',
            timestamp: Date.now()
          }));
        } catch (storageError) {
          console.error("Storage error:", storageError);
        }
        
        // Si nous avons échoué mais que nous n'avons pas encore trop réessayé
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          toast.info("Nouvelle tentative de confirmation...");
          setTimeout(() => {
            setStatus('processing');
            setProgress(0);
            setLoading(true);
            handleEmailConfirmation();
          }, 1500);
          return;
        }
        
        // Si trop d'échecs, rediriger vers la connexion
        setTimeout(() => {
          navigate('/connexion?error=confirmation_failed', { replace: true });
        }, 1000);
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [navigate, location, retryCount, extractAccessToken, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-6 w-full max-w-md">
        <div className="flex flex-col items-center space-y-4">
          {loading || status === 'processing' ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center">Vérification de votre email en cours...</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {progress < 30 && "Vérification de vos informations..."}
                {progress >= 30 && progress < 60 && "Création de votre profil..."}
                {progress >= 60 && "Presque terminé..."}
              </p>
              {retryCount > 0 && (
                <p className="text-xs text-muted-foreground">Tentative {retryCount}/3</p>
              )}
            </>
          ) : status === 'success' ? (
            <>
              <div className="h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="text-center">Email confirmé avec succès!</p>
              <p className="text-sm text-muted-foreground text-center">Vous allez être redirigé...</p>
            </>
          ) : (
            <>
              <div className="h-8 w-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
              <p className="text-center">Erreur lors de la confirmation de l'email</p>
              <p className="text-sm text-muted-foreground text-center">Vous allez être redirigé vers la page de connexion...</p>
              {retryCount > 0 && (
                <p className="text-xs text-muted-foreground">Tentatives échouées: {retryCount}/3</p>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
