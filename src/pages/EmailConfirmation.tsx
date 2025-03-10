
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function EmailConfirmation() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [progress, setProgress] = useState<number>(0);
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
        setProgress(10);
        
        // Get the user information from token
        const { data: { user }, error: sessionError } = await supabase.auth.getUser(accessToken);

        if (sessionError || !user) {
          throw sessionError || new Error('User not found');
        }
        
        setProgress(30);
        
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
          }, { onConflict: 'id' });
          
        if (userError) {
          console.error("Error creating user record:", userError);
        }
        
        setProgress(50);
        
        // Prepare redirection
        let redirectPath = '/';
        
        // Exécuter les deux créations de profil en parallèle pour gagner du temps
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
              created_at: new Date().toISOString()
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
              // Add more required fields to prevent null constraints
              education: [],
              skills: [],
              languages: [],
              social_links: {},
              is_premium: false,
              disponibility: "upcoming"
            }, { onConflict: 'id' });
            
          if (stagiaireError) {
            console.error("Error creating intern profile:", stagiaireError);
          }
            
          redirectPath = `/stagiaires/${user.id}`;
        } 
        else {
          redirectPath = '/complete-profile';
        }

        setProgress(90);
        setStatus('success');
        toast.success('Email confirmé avec succès');
        
        // Mettre en cache l'utilisateur pour accélérer le chargement
        localStorage.setItem(`cachedUserProfile_${user.id}`, JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            role: role || 'stagiaire',
            name: name, 
            email_confirmed_at: user.email_confirmed_at,
            user_metadata: user.user_metadata
          },
          timestamp: Date.now()
        }));
        
        setProgress(100);
        
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
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {progress < 30 && "Vérification de vos informations..."}
                {progress >= 30 && progress < 60 && "Création de votre profil..."}
                {progress >= 60 && "Presque terminé..."}
              </p>
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
