
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const email = searchParams.get('email');
        
        if (!token_hash || !type || !email) {
          setStatus('error');
          setErrorMessage('Lien de confirmation invalide. Veuillez vérifier votre email à nouveau.');
          return;
        }

        if (type !== 'signup' && type !== 'recovery') {
          setStatus('error');
          setErrorMessage('Type de confirmation non reconnu.');
          return;
        }

        // Vérifier le token avec Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type === 'recovery' ? 'recovery' : 'signup',
          email,
        });

        if (error) {
          console.error('Erreur lors de la vérification du token:', error);
          setStatus('error');
          setErrorMessage(error.message);
          return;
        }

        // Succès
        setStatus('success');
        toast.success('Email confirmé avec succès !');
        
        // Rediriger après 3 secondes
        setTimeout(() => {
          if (type === 'recovery') {
            navigate('/reset-password');
          } else {
            navigate('/connexion');
          }
        }, 3000);
      } catch (error: any) {
        console.error('Erreur lors de la confirmation de l\'email:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Une erreur est survenue lors de la confirmation de votre email.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleGoToLogin = () => {
    navigate('/connexion');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {status === 'loading' && 'Confirmation de votre email...'}
            {status === 'success' && 'Email confirmé !'}
            {status === 'error' && 'Erreur de confirmation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {status === 'loading' && (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center mt-4 text-lg">
                Votre adresse email a été confirmée avec succès.
              </p>
              <p className="text-center mt-2 text-muted-foreground">
                Vous allez être redirigé vers la page de connexion...
              </p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-center mt-4 text-lg">
                Impossible de confirmer votre email.
              </p>
              <p className="text-center mt-2 text-destructive">
                {errorMessage || 'Une erreur est survenue lors de la confirmation.'}
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          {status === 'error' && (
            <>
              <Button variant="outline" onClick={handleGoToHome}>
                Accueil
              </Button>
              <Button onClick={handleGoToLogin}>
                Se connecter
              </Button>
            </>
          )}
          {status === 'success' && (
            <Button onClick={handleGoToLogin}>
              Se connecter maintenant
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
