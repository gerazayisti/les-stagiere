
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
  phone?: string; // Rendu optionnel
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
    stagiaire_id: string;
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
    entreprise_name?: string;
    entreprise_logo?: string;
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
  addSkill: (skill: string) => Promise<void>;
  removeSkill: (skill: string) => Promise<void>;
  addLanguage: (language: string) => Promise<void>;
  removeLanguage: (language: string) => Promise<void>;
  addLocation: (location: string) => Promise<void>;
  removeLocation: (location: string) => Promise<void>;
  fetchRecommendations: () => Promise<void>;
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

      // Récupérer les données du stagiaire
      const { data, error: fetchError } = await supabase
        .from('stagiaires')
        .select(`
          *,
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

      // Récupérer les recommandations
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('recommendations')
        .select(`
          *,
          entreprises (
            name,
            logo_url
          )
        `)
        .eq('stagiaire_id', stagiaireId)
        .order('created_at', { ascending: false });

      if (recommendationsError) {
        console.error("Erreur lors de la récupération des recommandations:", recommendationsError);
      }

      // Formater les recommandations
      const formattedRecommendations = recommendationsData ? recommendationsData.map((rec: any) => ({
        ...rec,
        entreprise_name: rec.entreprises?.name,
        entreprise_logo: rec.entreprises?.logo_url
      })) : [];

      // Définir les données du stagiaire avec ses recommandations
      setStagiaire({
        ...data,
        recommendations: formattedRecommendations
      } as StagiaireData);
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

  // Fonction pour uploader un avatar
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

  // Fonction pour uploader un CV
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

  // Gérer les skills
  const addSkill = async (skill: string) => {
    if (!stagiaire) return;
    const updatedSkills = [...(stagiaire.skills || []), skill];
    await updateStagiaire({ skills: updatedSkills });
  };

  const removeSkill = async (skill: string) => {
    if (!stagiaire) return;
    const updatedSkills = stagiaire.skills.filter(s => s !== skill);
    await updateStagiaire({ skills: updatedSkills });
  };

  // Gérer les langues
  const addLanguage = async (language: string) => {
    if (!stagiaire) return;
    const updatedLanguages = [...(stagiaire.languages || []), language];
    await updateStagiaire({ languages: updatedLanguages });
  };

  const removeLanguage = async (language: string) => {
    if (!stagiaire) return;
    const updatedLanguages = stagiaire.languages.filter(l => l !== language);
    await updateStagiaire({ languages: updatedLanguages });
  };

  // Gérer les lieux
  const addLocation = async (location: string) => {
    if (!stagiaire) return;
    const updatedLocations = [...(stagiaire.preferred_locations || []), location];
    await updateStagiaire({ preferred_locations: updatedLocations });
  };

  const removeLocation = async (location: string) => {
    if (!stagiaire) return;
    const updatedLocations = stagiaire.preferred_locations.filter(l => l !== location);
    await updateStagiaire({ preferred_locations: updatedLocations });
  };

  // Récupérer les recommandations
  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          entreprises (
            name,
            logo_url
          )
        `)
        .eq('stagiaire_id', stagiaireId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Formater les données
      const formattedRecommendations = data.map((rec: any) => ({
        ...rec,
        entreprise_name: rec.entreprises?.name,
        entreprise_logo: rec.entreprises?.logo_url
      }));

      setStagiaire(prev => prev ? { ...prev, recommendations: formattedRecommendations } : null);
      
      // Le problème de type vient d'ici - nous retournons un array
      // mais la fonction est censée retourner void
    } catch (error) {
      console.error("Erreur lors de la récupération des recommandations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les recommandations",
        variant: "destructive",
      });
    }
  };

  return {
    stagiaire,
    loading,
    error,
    updateStagiaire,
    uploadAvatar,
    uploadCV,
    addSkill,
    removeSkill,
    addLanguage,
    removeLanguage,
    addLocation,
    removeLocation,
    fetchRecommendations
  };
}
