
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { auth } from '@/lib/auth';

export default function EmailConfirmation() {
  const [loading, setLoading] = useState(true);
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

        // Get the session to get user information
        const { data: { user }, error: sessionError } = await supabase.auth.getUser(accessToken);

        if (sessionError || !user) {
          throw sessionError || new Error('User not found');
        }

        // Create or update profile in the database
        await auth.createProfileAfterConfirmation(user.id);

        // Redirect based on user role
        const role = user.user_metadata?.role;
        if (role === 'entreprise') {
          navigate(`/entreprises/${user.id}`);
        } else if (role === 'stagiaire') {
          navigate(`/stagiaires/${user.id}`);
        } else {
          navigate('/complete-profile');
        }

        toast.success('Email confirmé avec succès');
      } catch (error: any) {
        console.error('Erreur lors de la confirmation de l\'email:', error);
        toast.error('Erreur lors de la confirmation de l\'email');
        navigate('/connexion?error=confirmation_failed');
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Vérification de votre email...</p>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
