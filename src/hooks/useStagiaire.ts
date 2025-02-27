
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export interface StagiaireData {
  id: string;
  name: string;
  avatar_url?: string;
  title: string;
  location: string;
  bio: string;
  email: string;
  phone?: string; // Rendre phone optionnel
  education: string;
  disponibility?: string;
  is_premium?: boolean;
  skills: string[];
  languages: string[];
  preferred_locations: string[];
  cv_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  recommendations?: Array<{
    id: string;
    entreprise_id: string;
    position: string;
    department: string;
    period: string;
    start_date: string;
    end_date: string;
    rating: number;
    content: string;
    skills: string[];
    achievements: string[];
    is_public: boolean;
    created_at: string;
    updated_at: string;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    image_url?: string;
    project_url?: string;
    github_url?: string;
  }>;
}

interface UseStagiaireResult {
  stagiaire: StagiaireData | null;
  loading: boolean;
  error: string | null;
  updateStagiaire: (data: Partial<StagiaireData>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  uploadCV: (file: File) => Promise<string>;
}

export function useStagiaire(stagiaireId: string): UseStagiaireResult {
  const [stagiaire, setStagiaire] = useState<StagiaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStagiaire();
  }, [stagiaireId]);

  const fetchStagiaire = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stagiaires')
        .select(`
          *,
          recommendations!recommendations_stagiaire_id_fkey (
            id,
            entreprise_id,
            position,
            department,
            period,
            start_date,
            end_date,
            rating,
            content,
            skills,
            achievements,
            is_public,
            created_at,
            updated_at
          ),
          projects (
            id,
            title,
            description,
            technologies,
            image_url,
            project_url,
            github_url
          )
        `)
        .eq('id', stagiaireId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Stagiaire non trouvé');

      setStagiaire(data as StagiaireData);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du stagiaire",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStagiaire = async (data: Partial<StagiaireData>) => {
    try {
      const { error: updateError } = await supabase
        .from('stagiaires')
        .update(data)
        .eq('id', stagiaireId);

      if (updateError) throw updateError;

      setStagiaire(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
      throw err;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${stagiaireId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      await updateStagiaire({ avatar_url: publicUrl });
      return publicUrl;
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'avatar",
        variant: "destructive",
      });
      throw err;
    }
  };

  const uploadCV = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${stagiaireId}-${Math.random()}.${fileExt}`;
      const filePath = `cvs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      await updateStagiaire({ cv_url: publicUrl });
      return publicUrl;
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le CV",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    stagiaire,
    loading,
    error,
    updateStagiaire,
    uploadAvatar,
    uploadCV,
  };
}
