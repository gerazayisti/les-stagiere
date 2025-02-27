import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export type ProfileType = 'stagiaire' | 'entreprise';

interface UseProfileProps {
  id: string;
  type: ProfileType;
}

export function useProfile({ id, type }: UseProfileProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        setError(null);

        // Vérifier si l'utilisateur est connecté
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!session) {
          toast({
            title: "Accès refusé",
            description: "Vous devez être connecté pour accéder à cette page",
            variant: "destructive",
          });
          navigate('/connexion');
          return;
        }

        // Vérifier si le profil existe
        const { data: profileData, error: profileError } = await supabase
          .from(type === 'stagiaire' ? 'stagiaires' : 'entreprises')
          .select('*')
          .eq('id', id)
          .single();

        if (profileError || !profileData) {
          setError("Profil introuvable");
          toast({
            title: "Erreur",
            description: "Ce profil n'existe pas",
            variant: "destructive",
          });
          return;
        }

        // Vérifier si l'utilisateur est le propriétaire du profil
        setIsOwner(session.user.id === id);

        // Vérifier si l'utilisateur a le bon rôle pour accéder à ce type de profil
        const userRole = session.user.user_metadata?.role;
        if (userRole !== type && !isOwner) {
          setError("Accès non autorisé");
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas les permissions nécessaires pour accéder à ce profil",
            variant: "destructive",
          });
          return;
        }

        setProfile(profileData);
      } catch (error: any) {
        console.error('Erreur lors de la vérification du profil:', error);
        setError(error.message);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la vérification du profil",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [id, type, navigate]);

  return { profile, loading, error, isOwner };
}
