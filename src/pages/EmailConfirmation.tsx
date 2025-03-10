
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

export default function EmailConfirmation() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        setLoading(true);
        
        // Récupérer le hash de l'URL
        const hash = window.location.hash.substring(1);
        
        // Extraire les paramètres du hash
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');
        const tokenType = params.get('token_type');
        
        // Si pas d'access token, c'est que l'URL n'est pas complète
        if (!accessToken) {
          setError("Lien de confirmation invalide");
          setLoading(false);
          return;
        }
        
        // Configurer la session
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error) {
          throw error;
        }
        
        if (data.user) {
          setEmail(data.user.email);
          setSuccess(true);
          
          // Mettre à jour le statut d'authentification
          await refreshUser();
          
          // Redirection automatique après quelques secondes
          setTimeout(() => {
            navigate('/connexion');
          }, 5000);
        } else {
          setError("Impossible de vérifier votre email");
        }
      } catch (error: any) {
        console.error("Erreur lors de la confirmation du mail:", error);
        setError(error.message || "Une erreur est survenue lors de la confirmation de votre email");
      } finally {
        setLoading(false);
      }
    };
    
    handleEmailConfirmation();
  }, [navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Confirmation de votre email
          </CardTitle>
          <CardDescription className="text-center">
            Nous vérifions la validité de votre email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center py-6">
          {loading ? (
            <div className="text-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
              <p className="mt-4 text-lg">Vérification en cours...</p>
            </div>
          ) : success ? (
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-gray-100">
                Email confirmé avec succès
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Votre adresse email {email} a été confirmée. Vous pouvez maintenant vous connecter.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Redirection automatique vers la page de connexion...
              </p>
            </div>
          ) : (
            <div className="text-center w-full">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4">
          {!loading && (
            success ? (
              <Button asChild>
                <Link to="/connexion">Aller à la connexion</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/">Retour à l'accueil</Link>
                </Button>
                <Button asChild>
                  <Link to="/inscription">Réessayer l'inscription</Link>
                </Button>
              </>
            )
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
