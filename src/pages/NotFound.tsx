
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    const checkAndRedirect = async () => {
      // Check if this might be a failed auth redirect
      if (location.pathname.includes("/email-confirmation") || 
          location.search.includes("type=recovery") || 
          location.search.includes("type=signup")) {
        
        // Attempt to get session - this can help with email confirmation redirects
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          // User is authenticated, redirect based on role
          const role = data.session.user.user_metadata?.role || 'stagiaire';
          if (role === 'entreprise') {
            window.location.href = `/entreprises/${data.session.user.id}`;
            return;
          } else if (role === 'stagiaire') {
            window.location.href = `/stagiaires/${data.session.user.id}`;
            return;
          }
        }
      }
    };

    checkAndRedirect();
    
    // Log the error for debugging purposes
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Search params:",
      location.search, 
      "Hash:", 
      location.hash
    );
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FileQuestion className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">404</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg text-muted-foreground">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
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
