
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { toast } from 'sonner';

export default function EmailConfirmation() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          setError("Aucune session trouvée. Veuillez vous connecter à nouveau.");
          return;
        }
        
        const user = session.user;
        
        if (user.email_confirmed_at) {
          console.log("Email confirmé, création du profil utilisateur...");
          
          // Créer le profil utilisateur maintenant que l'email est confirmé
          const result = await auth.createProfileAfterConfirmation(user.id);
          
          if (!result.success) {
            console.error("Erreur lors de la création du profil:", result.error);
            toast.error("Erreur lors de la création du profil", {
              description: result.error?.message || "Une erreur est survenue"
            });
            setError("Votre email a été confirmé, mais il y a eu un problème lors de la création de votre profil.");
            return;
          }
          
          setSuccess(true);
          toast.success("Email confirmé", {
            description: "Votre compte a été activé avec succès"
          });
          
          // Redirection automatique après 3 secondes
          setTimeout(() => {
            navigate('/complete-profile');
          }, 3000);
        } else {
          setError("Votre email n'a pas encore été confirmé. Veuillez vérifier votre boîte mail.");
        }
      } catch (error: any) {
        console.error("Erreur lors de la vérification de confirmation d'email:", error);
        setError(error.message || "Une erreur est survenue lors de la vérification de votre email");
      } finally {
        setLoading(false);
      }
    };
    
    checkEmailConfirmation();
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Confirmation de l'email
          </CardTitle>
          <CardDescription className="text-center">
            Vérification de votre adresse email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center space-y-4 py-6">
          {loading ? (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="text-center text-muted-foreground">
                Vérification de la confirmation de votre email...
              </p>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <div className="text-center">
                <p className="font-medium text-lg">Email confirmé avec succès!</p>
                <p className="text-muted-foreground mt-1">
                  Votre compte a été activé et votre profil a été créé.
                </p>
                <p className="text-muted-foreground mt-1">
                  Vous allez être redirigé vers la page de complétion de profil...
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-16 w-16 text-amber-500" />
              <div className="text-center">
                <p className="font-medium text-lg">Confirmation échouée</p>
                <p className="text-muted-foreground mt-1">{error}</p>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          {!loading && (
            error ? (
              <div className="w-full flex flex-col space-y-2">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/connexion">Retourner à la connexion</Link>
                </Button>
              </div>
            ) : success ? (
              <Button asChild className="w-full">
                <Link to="/complete-profile">Compléter mon profil</Link>
              </Button>
            ) : null
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
