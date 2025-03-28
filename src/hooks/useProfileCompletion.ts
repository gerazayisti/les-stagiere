
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface UseProfileCompletionProps {
  userId?: string | null;
  userRole?: string | null;
}

export interface ProfileStatus {
  isComplete: boolean;
  missingFields: string[];
  profile: any | null;
  userId?: string | null;
  userRole?: string | null;
}

export function useProfileCompletion({ userId, userRole }: UseProfileCompletionProps = {}) {
  const [status, setStatus] = useState<ProfileStatus>({
    isComplete: false,
    missingFields: [],
    profile: null,
    userId,
    userRole
  });
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Nous simplifions les champs requis à seulement name et bio/description
  const requiredFieldsStagiaire = ['name', 'bio'];
  const requiredFieldsEntreprise = ['name', 'description'];

  useEffect(() => {
    if (userId && userRole) {
      checkProfileCompletion();
    } else {
      setLoading(false);
      setStatus({
        isComplete: false,
        missingFields: [],
        profile: null,
        userId,
        userRole
      });
    }
  }, [userId, userRole]);

  const checkProfileCompletion = async () => {
    if (!userId || !userRole) {
      setStatus({
        isComplete: false,
        missingFields: [],
        profile: null,
        userId,
        userRole
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Sélectionner la table appropriée en fonction du rôle
      const table = userRole === 'stagiaire' ? 'stagiaires' : 'entreprises';
      const requiredFields = userRole === 'stagiaire' ? requiredFieldsStagiaire : requiredFieldsEntreprise;

      const { data: profile, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du profil:', error);
        setStatus({
          isComplete: false,
          missingFields: requiredFields,
          profile: null,
          userId,
          userRole
        });
        if (error.code !== 'PGRST116') { // Ignore l'erreur "not found"
          toast({
            title: "Erreur",
            description: "Impossible de vérifier l'état du profil",
            variant: "destructive",
          });
        }
        return;
      }

      if (!profile) {
        setStatus({
          isComplete: false,
          missingFields: requiredFields,
          profile: null,
          userId,
          userRole
        });
        if (window.location.pathname !== '/complete-profile') {
          navigate('/complete-profile');
        }
        return;
      }

      // Vérifier si tous les champs requis sont remplis
      const missingFields = requiredFields.filter(field => {
        const value = profile[field];
        if (Array.isArray(value)) {
          return value.length === 0;
        }
        return !value;
      });

      const isComplete = missingFields.length === 0;
      setStatus({
        isComplete,
        missingFields,
        profile,
        userId,
        userRole
      });

      // Rediriger vers la page de complétion si le profil est incomplet
      if (!isComplete && window.location.pathname !== '/complete-profile') {
        navigate('/complete-profile');
      }

    } catch (error) {
      console.error('Erreur lors de la vérification du profil:', error);
      setStatus({
        isComplete: false,
        missingFields: [],
        profile: null,
        userId,
        userRole
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    ...status,
    loading,
    checkProfileCompletion
  };
}
