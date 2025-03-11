
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, LogIn, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const redirectInProgress = useRef(false);

  useEffect(() => {
    // Fonction pour vérifier et rediriger l'utilisateur si nécessaire
    const checkAndRedirect = async () => {
      // Éviter les appels multiples simultanés
      if (redirectInProgress.current || loading) return;
      redirectInProgress.current = true;
      
      try {
        setLoading(true);
        
        // Journalisation de l'erreur pour le débogage
        console.error(
          "404 Error: User attempted to access non-existent route:",
          location.pathname,
          "Search params:",
          location.search, 
          "Hash:", 
          location.hash
        );
        
        // Vérifier si c'est une redirection d'authentification échouée
        const isAuthRelated = 
          location.pathname.includes("/email-confirmation") || 
          location.search.includes("type=recovery") || 
          location.search.includes("type=signup") ||
          location.hash.includes("access_token=") ||
          location.pathname === "/";
        
        const isProfilePage = 
          location.pathname.includes("/entreprises/") || 
          location.pathname.includes("/stagiaires/");
        
        // Journalisation pour le débogage
        if (isAuthRelated || isProfilePage) {
          console.log("This appears to be an auth-related or profile page redirect");
          
          try {
            // Vérification de la session actuelle
            const { data, error } = await supabase.auth.getSession();
            console.log("Current session check:", data?.session ? "Has session" : "No session", error ? `Error: ${error.message}` : "No error");
            
            if (data?.session?.user) {
              const role = data.session.user.user_metadata?.role || 'stagiaire';
              const userId = data.session.user.id;
              
              // Si nous avons une session valide, rediriger vers la page de profil appropriée
              try {
                // Gérer les erreurs de profil incorrects
                if (isProfilePage) {
                  const pathSegments = location.pathname.split('/');
                  const pathId = pathSegments[pathSegments.length - 1];
                  
                  if (pathId !== userId) {
                    // L'utilisateur essaie d'accéder à un profil inexistant ou incorrect
                    if (retryCount < 2) {
                      // Rediriger vers son propre profil
                      const correctPath = role === 'entreprise' 
                        ? `/entreprises/${userId}` 
                        : `/stagiaires/${userId}`;
                      
                      toast.info("Redirection vers votre profil...");
                      navigate(correctPath, { replace: true });
                      return;
                    } else {
                      // Après plusieurs tentatives, rediriger vers l'accueil
                      setErrorDetails("Impossible d'accéder au profil demandé après plusieurs tentatives");
                      navigate('/', { replace: true });
                      return;
                    }
                  }
                }
                
                // Redirection basée sur le rôle de l'utilisateur pour les autres cas
                if (role === 'entreprise') {
                  navigate(`/entreprises/${userId}`, { replace: true });
                  return;
                } else if (role === 'stagiaire') {
                  navigate(`/stagiaires/${userId}`, { replace: true });
                  return;
                } else {
                  navigate('/complete-profile', { replace: true });
                  return;
                }
              } catch (profileError) {
                console.error("Error during profile redirect:", profileError);
                setErrorDetails("Erreur lors de la redirection vers votre profil");
                // En cas d'erreur, continuer avec la gestion normale de 404
              }
            } else if (location.pathname === "/") {
              // Si nous sommes sur la page d'accueil sans session
              navigate('/', { replace: true, state: { noRedirect: true } });
              return;
            } else if (location.hash.includes("access_token=")) {
              // Si nous avons un token d'accès dans le hash mais pas de session
              navigate('/email-confirmation' + location.search + location.hash, { replace: true });
              return;
            }
          } catch (sessionError) {
            console.error("Session check error:", sessionError);
            setErrorDetails("Erreur lors de la vérification de votre session");
            // Continuer avec la gestion normale de 404
          }
        }
      } catch (error: any) {
        console.error("Error during redirect check:", error);
        setErrorDetails(error.message || "Une erreur s'est produite lors de la redirection");
      } finally {
        setLoading(false);
        setRedirectAttempted(true);
        redirectInProgress.current = false;
      }
    };

    // Tenter la redirection seulement si nous n'avons pas déjà essayé
    // et si l'utilisateur n'a pas explicitement demandé à ne pas être redirigé
    if (!redirectAttempted && !location.state?.noRedirect && retryCount < 3) {
      checkAndRedirect();
    }
  }, [location, navigate, redirectAttempted, retryCount, loading]);

  const handleRetry = () => {
    setRedirectAttempted(false);
    setRetryCount(prev => prev + 1);
    setErrorDetails(null);
  };

  const handleHomeClick = () => {
    // Force navigation to home with no redirect flag
    navigate('/', { replace: true, state: { noRedirect: true } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {loading ? (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            ) : (
              <FileQuestion className="h-16 w-16 text-primary" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold">404</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {loading ? (
            <p className="text-lg text-muted-foreground">
              Tentative de récupération de votre session...
            </p>
          ) : (
            <>
              <p className="text-lg text-muted-foreground">
                La page que vous recherchez n'existe pas ou a été déplacée.
              </p>
              {errorDetails && (
                <div className="flex items-center justify-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <p>{errorDetails}</p>
                </div>
              )}
            </>
          )}
          <div className="flex flex-col gap-3">
            <Button 
              className="w-full" 
              disabled={loading} 
              onClick={handleHomeClick}
            >
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="w-full" 
              disabled={loading}
            >
              <Link to="/connexion">
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </Link>
            </Button>
            {!loading && redirectAttempted && (
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={handleRetry}
                disabled={retryCount >= 3}
              >
                <Loader2 className="mr-2 h-4 w-4" />
                Réessayer la redirection 
                {retryCount > 0 && ` (${retryCount}/3)`}
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          {retryCount >= 3 ? (
            "Nombre maximum de tentatives atteint. Veuillez réessayer plus tard."
          ) : (
            "Si le problème persiste, veuillez contacter le support."
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;
