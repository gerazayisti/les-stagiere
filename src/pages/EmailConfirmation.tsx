
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function EmailConfirmation() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const hash = window.location.hash;
        if (!hash) {
          throw new Error('No confirmation token found');
        }

        // Extract access_token from URL hash
        const accessToken = hash.split('&').find(param => param.startsWith('#access_token='))?.split('=')[1];
        
        if (!accessToken) {
          throw new Error('No access token found');
        }

        setStatus('processing');
        
        // Get the user information from token
        const { data: { user }, error: sessionError } = await supabase.auth.getUser(accessToken);

        if (sessionError || !user) {
          throw sessionError || new Error('User not found');
        }
        
        // Get role from user metadata
        const role = user.user_metadata?.role;
        const name = user.user_metadata?.name || 'Utilisateur';
        
        // Create basic user record first (lightweight operation)
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            role: role || 'stagiaire',
            name: name,
            is_active: true
          });
          
        if (userError) {
          console.error("Error creating user record:", userError);
        }
        
        // Prepare redirection
        let redirectPath = '/';
        
        if (role === 'entreprise') {
          // Create enterprise profile in background
          supabase
            .from('entreprises')
            .upsert({
              id: user.id,
              name: name,
              email: user.email,
              logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
              is_verified: false,
              created_at: new Date().toISOString()
            })
            .then(({ error }) => {
              if (error) console.error("Error creating enterprise profile:", error);
            });
            
          redirectPath = `/entreprises/${user.id}`;
        } 
        else if (role === 'stagiaire') {
          // Create intern profile in background
          supabase
            .from('stagiaires')
            .upsert({
              id: user.id,
              name: name,
              email: user.email,
              avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
              is_verified: false,
              created_at: new Date().toISOString()
            })
            .then(({ error }) => {
              if (error) console.error("Error creating intern profile:", error);
            });
            
          redirectPath = `/stagiaires/${user.id}`;
        } 
        else {
          redirectPath = '/complete-profile';
        }

        setStatus('success');
        toast.success('Email confirmé avec succès');
        
        // Set a short timeout to ensure toast is seen
        setTimeout(() => {
          navigate(redirectPath);
        }, 800);
      } catch (error: any) {
        console.error('Erreur lors de la confirmation de l\'email:', error);
        setStatus('error');
        toast.error('Erreur lors de la confirmation de l\'email');
        
        // Short timeout to ensure error is seen
        setTimeout(() => {
          navigate('/connexion?error=confirmation_failed');
        }, 1500);
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-6 w-full max-w-md">
        <div className="flex flex-col items-center space-y-4">
          {loading || status === 'processing' ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center">Vérification de votre email en cours...</p>
              <p className="text-sm text-muted-foreground text-center">Cela peut prendre quelques instants</p>
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
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
