
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Recommendation } from '@/types/recommendations';

export interface StagiaireData {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  cv_url?: string;
  phone?: string;
  date_of_birth?: string;
  skills?: string[];
  education?: string;
  experience?: string;
  location?: string;
  languages?: string[];
  preferred_locations?: string[];
  availability?: string;
  is_premium?: boolean;
  is_profile_complete?: boolean;
  created_at?: string;
  updated_at?: string;
  title?: string; // Ajout du titre
  disponibility?: string; // Ajout de disponibility (même si on a déjà availability)
  projects?: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    link?: string;
    image_url?: string;
  }>;
  recommendations?: Recommendation[];
}

export function useStagiaire(stagiaireId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stagiaire, setStagiaire] = useState<StagiaireData | null>(null);
  const navigate = useNavigate();
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
        .select('*')
        .eq('id', stagiaireId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError("Ce profil n'existe pas");
          toast({
            title: "Profil introuvable",
            description: "Le profil demandé n'existe pas",
            variant: "destructive",
          });
          return;
        }
        throw fetchError;
      }

      // Mock data for development (à remplacer par les vraies données quand disponibles)
      const mockStagiaire: StagiaireData = {
        id: stagiaireId,
        name: data?.name || "Utilisateur inconnu",
        email: data?.email || "email@example.com",
        bio: data?.bio || "Étudiant passionné en recherche de stage dans le domaine du développement web. Je suis actuellement en formation à l'université et je cherche à mettre en pratique mes compétences techniques dans un environnement professionnel stimulant.",
        avatar_url: data?.avatar_url || "https://randomuser.me/api/portraits/men/1.jpg",
        cv_url: data?.cv_url || "",
        phone: data?.phone || "+33 6 12 34 56 78",
        skills: data?.skills || ["JavaScript", "React", "Node.js", "TypeScript", "HTML/CSS", "Git"],
        education: data?.education || "Master en Informatique, Université de Paris",
        experience: data?.experience || "1 an d'expérience en développement web",
        location: data?.location || "Paris, France",
        languages: data?.languages || ["Français (natif)", "Anglais (professionnel)", "Espagnol (intermédiaire)"],
        preferred_locations: data?.preferred_locations || ["Paris", "Lyon", "Bordeaux", "Télétravail"],
        availability: data?.availability || "Disponible dès maintenant",
        title: data?.title || "Étudiant en Informatique",
        disponibility: data?.disponibility || "Disponible dès maintenant",
        is_premium: data?.is_premium || false,
        is_profile_complete: data?.is_profile_complete || true,
        projects: data?.projects || [
          {
            id: "1",
            title: "Portfolio Personnel",
            description: "Un site web portfolio créé avec React et Tailwind CSS pour présenter mes projets et compétences.",
            technologies: ["React", "Tailwind CSS", "Vite"],
            link: "https://portfolio.example.com",
            image_url: "https://placehold.co/600x400"
          },
          {
            id: "2",
            title: "Application de Gestion de Tâches",
            description: "Une application web permettant de gérer des tâches quotidiennes avec possibilité de créer, modifier et supprimer des tâches.",
            technologies: ["JavaScript", "Node.js", "MongoDB"],
            link: "https://tasks.example.com",
            image_url: "https://placehold.co/600x400"
          }
        ],
        recommendations: []
      };

      setStagiaire(mockStagiaire);

      // Charger les recommandations si l'utilisateur est premium
      if (mockStagiaire.is_premium) {
        fetchRecommendations();
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement du profil:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStagiaire = async (updatedData: Partial<StagiaireData>) => {
    try {
      setLoading(true);

      const { error: updateError } = await supabase
        .from('stagiaires')
        .update(updatedData)
        .eq('id', stagiaireId);

      if (updateError) throw updateError;

      setStagiaire(prev => prev ? { ...prev, ...updatedData } : null);

      toast({
        title: "Profil mis à jour",
        description: "Votre profil a été mis à jour avec succès.",
      });

      return true;
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setLoading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${stagiaireId}-avatar.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Construire l'URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Mettre à jour le profil avec la nouvelle URL
      await updateStagiaire({ avatar_url: publicUrl });

      setStagiaire(prev => prev ? { ...prev, avatar_url: publicUrl } : null);

      toast({
        title: "Avatar mis à jour",
        description: "Votre avatar a été mis à jour avec succès.",
      });

      return publicUrl;
    } catch (err: any) {
      console.error('Erreur lors du téléchargement de l\'avatar:', err);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'avatar",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadCV = async (file: File) => {
    try {
      setLoading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${stagiaireId}-cv.${fileExt}`;
      const filePath = `cvs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Construire l'URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Mettre à jour le profil avec la nouvelle URL
      await updateStagiaire({ cv_url: publicUrl });

      setStagiaire(prev => prev ? { ...prev, cv_url: publicUrl } : null);

      toast({
        title: "CV mis à jour",
        description: "Votre CV a été mis à jour avec succès.",
      });

      return publicUrl;
    } catch (err: any) {
      console.error('Erreur lors du téléchargement du CV:', err);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le CV",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      console.log("Fetching recommendations for stagiaire ID:", stagiaireId);
      
      // Simuler une réponse d'API pour le développement
      const mockRecommendations = [
        {
          id: "rec1",
          entreprise_id: "ent1",
          stagiaire_id: stagiaireId,
          position: "Développeur Frontend",
          department: "Équipe Web",
          period: "Janvier - Juin 2023",
          content: "Jean a fait preuve d'une grande autonomie et d'une capacité d'apprentissage remarquable durant son stage. Il a contribué significativement à plusieurs projets clés.",
          rating: 5,
          author_name: "Marie Dupont",
          author_position: "Directrice Technique",
          company_name: "TechSolutions",
          company_logo: "https://placehold.co/100",
          created_at: "2023-07-01",
          updated_at: "2023-07-01",
          is_public: true
        },
        {
          id: "rec2",
          entreprise_id: "ent2",
          stagiaire_id: stagiaireId,
          position: "Assistant Marketing Digital",
          department: "Marketing",
          period: "Septembre - Décembre 2022",
          content: "Un stagiaire motivé qui a su s'intégrer rapidement dans l'équipe. Ses compétences en analyse de données ont été particulièrement utiles pour nos campagnes.",
          rating: 4,
          author_name: "Pierre Martin",
          author_position: "Responsable Marketing",
          company_name: "InnovCorp",
          company_logo: "https://placehold.co/100",
          created_at: "2023-01-15",
          updated_at: "2023-01-15",
          is_public: true
        }
      ];

      setStagiaire(prev => prev ? { ...prev, recommendations: mockRecommendations } : null);
      
    } catch (error) {
      console.error("Erreur lors de la récupération des recommandations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les recommandations",
        variant: "destructive",
      });
    }
  };

  const addProject = async (projectData: any) => {
    try {
      setLoading(true);

      // Dans un environnement réel, nous enverrions ces données à l'API
      // Simulons-le pour le développement
      const newProject = {
        id: `proj-${Date.now()}`,
        ...projectData,
      };

      const updatedProjects = stagiaire?.projects 
        ? [...stagiaire.projects, newProject] 
        : [newProject];

      // Update local state
      setStagiaire(prev => prev ? { 
        ...prev, 
        projects: updatedProjects 
      } : null);

      toast({
        title: "Projet ajouté",
        description: "Votre projet a été ajouté avec succès au portfolio.",
      });

      return newProject;
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du projet:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le projet",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      setLoading(true);

      if (!stagiaire?.projects) return;

      const updatedProjects = stagiaire.projects.filter(
        project => project.id !== projectId
      );

      setStagiaire(prev => prev ? { 
        ...prev, 
        projects: updatedProjects 
      } : null);

      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé de votre portfolio.",
      });
    } catch (err: any) {
      console.error('Erreur lors de la suppression du projet:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le projet",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    stagiaire,
    loading,
    error,
    updateStagiaire,
    uploadAvatar,
    uploadCV,
    fetchRecommendations,
    addProject,
    deleteProject
  };
}
