
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, LogIn, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    const checkAndRedirect = async () => {
      setLoading(true);
      
      try {
        // Log the error for debugging purposes
        console.error(
          "404 Error: User attempted to access non-existent route:",
          location.pathname,
          "Search params:",
          location.search, 
          "Hash:", 
          location.hash
        );
        
        // Check if this might be a failed auth redirect
        const isAuthRelated = 
          location.pathname.includes("/email-confirmation") || 
          location.search.includes("type=recovery") || 
          location.search.includes("type=signup") ||
          location.hash.includes("access_token=") ||
          location.hash.includes("error=") ||
          location.pathname === "/";  // Add homepage to auth check
        
        if (isAuthRelated) {
          console.log("This appears to be an auth-related redirect that failed or homepage issue");
          
          // AMÉLIORÉ: Extraction du token d'accès du hash pour toute URL
          let accessToken = '';
          if (location.hash) {
            const match = location.hash.match(/access_token=([^&]*)/);
            if (match && match[1]) {
              accessToken = match[1];
              console.log("Found access token in hash, redirecting to proper path");
              
              // Pour toute URL avec un token d'accès, rediriger vers la confirmation d'email
              const fullPath = `/email-confirmation${location.search}${location.hash}`;
              navigate(fullPath, { replace: true });
              return;
            }
          }
          
          // Attempt to get session - this can help with email confirmation redirects
          const { data, error } = await supabase.auth.getSession();
          console.log("Current session check:", data?.session ? "Has session" : "No session", error ? `Error: ${error.message}` : "No error");
          
          if (data.session?.user) {
            // User is authenticated, redirect based on role
            const role = data.session.user.user_metadata?.role || 'stagiaire';
            
            // Cache navigation state for faster loading with timestamp
            localStorage.setItem('navigation_state', JSON.stringify({ 
              user: {
                id: data.session.user.id,
                email: data.session.user.email,
                role: role,
                name: data.session.user.user_metadata?.name || 'Utilisateur', 
                email_confirmed_at: data.session.user.email_confirmed_at,
                user_metadata: data.session.user.user_metadata
              }, 
              userRole: role,
              timestamp: Date.now()  // Ajouté pour la fraîcheur du cache
            }));
            
            // Clear any stale error state
            sessionStorage.removeItem('auth_error');
            
            if (role === 'entreprise') {
              toast.success("Authentification réussie");
              navigate(`/entreprises/${data.session.user.id}`, { replace: true });
              return;
            } else if (role === 'stagiaire') {
              toast.success("Authentification réussie");
              navigate(`/stagiaires/${data.session.user.id}`, { replace: true });
              return;
            } else {
              toast.success("Authentification réussie");
              navigate('/complete-profile', { replace: true });
              return;
            }
          } else if (location.pathname === "/") {
            // Si nous sommes sur la page d'accueil sans session, mieux gérer la redirection
            navigate('/', { replace: true, state: { noRedirect: true, timestamp: Date.now() } });
            return;
          } else if (location.hash.includes("access_token=")) {
            // Si nous avons un token d'accès dans le hash mais pas de session, rediriger vers la confirmation
            navigate('/email-confirmation' + location.search + location.hash, { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error("Error during redirect check:", error);
      } finally {
        setLoading(false);
        setRedirectAttempted(true);
      }
    };

    // Only attempt redirect if we haven't tried already in this render cycle
    if (!redirectAttempted && !location.state?.noRedirect) {
      checkAndRedirect();
    }
  }, [location, navigate, redirectAttempted]);

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
            <p className="text-lg text-muted-foreground">
              La page que vous recherchez n'existe pas ou a été déplacée.
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full" disabled={loading}>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" disabled={loading}>
              <Link to="/connexion">
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
