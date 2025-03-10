
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function EmailConfirmation() {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        setVerifying(true);
        
        // Récupérer le token et type de la query string
        const params = new URLSearchParams(location.search);
        const token_hash = params.get('token_hash');
        const type = params.get('type');
        
        if (!token_hash || !type) {
          setError("Lien de confirmation invalide. Veuillez vérifier votre email et réessayer.");
          setVerifying(false);
          return;
        }

        console.log("Vérification du token:", { token_hash, type });
        
        // Vérifier le token avec Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });

        if (error) {
          console.error("Erreur lors de la vérification de l'email:", error);
          setError("Impossible de vérifier votre email. Le lien a peut-être expiré.");
          setSuccess(false);
        } else {
          console.log("Email vérifié avec succès");
          setSuccess(true);
          
          // Afficher un toast de succès
          toast.success("Email confirmé avec succès", {
            description: "Vous pouvez maintenant vous connecter à votre compte"
          });
          
          // Rediriger vers la page de connexion après 3 secondes
          setTimeout(() => {
            navigate('/connexion?email_confirmed=true');
          }, 3000);
        }
      } catch (error) {
        console.error("Exception lors de la confirmation de l'email:", error);
        setError("Une erreur inattendue s'est produite. Veuillez réessayer plus tard.");
        setSuccess(false);
      } finally {
        setVerifying(false);
      }
    };

    confirmEmail();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Confirmation d'Email</CardTitle>
          <CardDescription className="text-center">
            Nous vérifions votre adresse email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center py-6">
          {verifying ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="text-center text-lg font-medium">
                Vérification de votre email en cours...
              </p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-green-600">Email confirmé avec succès!</p>
                <p className="text-muted-foreground">
                  Vous allez être redirigé vers la page de connexion dans quelques instants.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-16 w-16 text-red-500" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-red-600">Échec de la confirmation</p>
                <p className="text-muted-foreground">{error || "Une erreur est survenue."}</p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/connexion')}
            disabled={verifying}
          >
            {success ? "Aller à la connexion" : "Retour à la connexion"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
