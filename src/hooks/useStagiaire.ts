import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Recommendation } from '@/types/recommendations';

export interface StagiaireData {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  summary: string | null;
  title: string | null;
  looking_for_internship: boolean;
  skills: string[];
  languages: string[];
  bio: string | null;
  location: string | null;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    start_date: string;
    end_date: string | null;
    description: string | null;
  }> | null;
  experience: Array<{
    company: string;
    position: string;
    start_date: string;
    end_date: string | null;
    description: string | null;
  }> | null;
  projects: Array<{
    title: string;
    description: string;
    url: string | null;
    image_url: string | null;
    tags: string[];
    technologies?: string[];
  }> | null;
  cv_url: string | null;
  social_links: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  } | null;
  preferred_locations: string[];
  availability_date: string | null;
  internship_duration: string | null;
  phone: string | null;
  disponibility: string | null;
  recommendations: Recommendation[];
  is_premium: boolean;
  is_verified: boolean;
  last_active: string;
}

export interface UseStagiaireProps {
  stagiaireId: string;
}

export function useStagiaire(stagiaireId: string) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stagiaire, setStagiaire] = useState<StagiaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStagiaire() {
      if (!stagiaireId) {
        setError("ID de stagiaire non fourni");
        setLoading(false);
        return;
      }

      try {
        // Récupérer les données du stagiaire
        const { data: stagiaireData, error: stagiaireError } = await supabase
          .from('stagiaires')
          .select('*')
          .eq('id', stagiaireId)
          .maybeSingle();

        if (stagiaireError) {
          console.error('Erreur lors de la récupération du stagiaire:', stagiaireError);
          
          // Improved error handling with more specific logging
          if (stagiaireError.code === 'PGRST116') {
            console.error(`Stagiaire avec ID ${stagiaireId} non trouvé dans la base de données`);
          }
          
          throw stagiaireError;
        }

        if (!stagiaireData) {
          throw new Error('Stagiaire non trouvé');
        }

        // Récupérer les recommandations
        const { data: recommendationsData, error: recommendationsError } = await supabase
          .from('recommendations')
          .select('*, entreprises(name, logo_url)')
          .eq('stagiaire_id', stagiaireId)
          .eq('is_public', true);

        if (recommendationsError) {
          console.error('Erreur lors de la récupération des recommandations:', recommendationsError);
        }

        // Formater les données des recommandations
        const formattedRecommendations = (recommendationsData || []).map((rec: any) => ({
          ...rec,
          company_name: rec.entreprises?.name || 'Entreprise',
          company_logo: rec.entreprises?.logo_url || null,
        }));

        // Assembler les données du stagiaire
        const formattedStagiaire: StagiaireData = {
          ...stagiaireData,
          recommendations: formattedRecommendations as Recommendation[],
        };

        setStagiaire(formattedStagiaire);
      } catch (error: any) {
        console.error('Erreur lors de la récupération du stagiaire:', error);
        setError(error.message || 'Une erreur est survenue');
        
        // If the stagiaire doesn't exist, redirect to home page instead of 404
        // This prevents the 404 error when the page doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('non trouvé')) {
          toast({
            title: "Profil non trouvé",
            description: "Le profil demandé n'existe pas ou n'est pas accessible",
            variant: "destructive",
          });
          navigate('/', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStagiaire();
  }, [stagiaireId, navigate]);

  const updateStagiaire = async (updatedData: Partial<StagiaireData>) => {
    if (!stagiaireId) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations: ID manquant",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Exclure les recommandations de la mise à jour
      const { recommendations, ...dataToUpdate } = updatedData;

      const { error } = await supabase
        .from('stagiaires')
        .update(dataToUpdate)
        .eq('id', stagiaireId);

      if (error) throw error;

      // Mettre à jour l'état local
      setStagiaire(prev => {
        if (!prev) return null;
        return { ...prev, ...updatedData };
      });

      toast({
        title: "Succès",
        description: "Informations mises à jour avec succès",
      });

      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const addRecommendation = async (recommendation: Omit<Recommendation, "id">) => {
    if (!stagiaireId || !stagiaire) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter une recommandation: données manquantes",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('recommendations')
        .insert({
          ...recommendation,
          stagiaire_id: stagiaireId,
          is_public: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour l'état local
      if (stagiaire && stagiaire.recommendations) {
        setStagiaire({
          ...stagiaire,
          recommendations: [...stagiaire.recommendations, data as Recommendation]
        });
      }

      toast({
        title: "Succès",
        description: "Recommandation ajoutée avec succès",
      });

      return data;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de la recommandation:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout de la recommandation",
        variant: "destructive",
      });
      
      return null;
    }
  };

  // Ajout des méthodes manquantes
  const uploadAvatar = async (file: File) => {
    if (!stagiaireId) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'avatar: ID manquant",
        variant: "destructive",
      });
      return false;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${stagiaireId}/${Date.now()}.${fileExt}`;

      // Upload du fichier
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('stagiaires')
        .update({ avatar_url: publicUrl })
        .eq('id', stagiaireId);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setStagiaire(prev => {
        if (!prev) return null;
        return { ...prev, avatar_url: publicUrl };
      });

      return true;
    } catch (error: any) {
      console.error('Erreur lors du téléchargement de l\'avatar:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du téléchargement de l'avatar",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const uploadCV = async (file: File) => {
    if (!stagiaireId) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le CV: ID manquant",
        variant: "destructive",
      });
      return false;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `cv/${stagiaireId}/${Date.now()}.${fileExt}`;

      // Upload du fichier
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('stagiaires')
        .update({ cv_url: publicUrl })
        .eq('id', stagiaireId);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setStagiaire(prev => {
        if (!prev) return null;
        return { ...prev, cv_url: publicUrl };
      });

      return true;
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du CV:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du téléchargement du CV",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const fetchRecommendations = async () => {
    if (!stagiaireId) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les recommandations: ID manquant",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          entreprises(name, logo_url)
        `)
        .eq('stagiaire_id', stagiaireId);

      if (error) throw error;

      // Formater les données
      const formattedData = data.map((rec: any) => ({
        ...rec,
        company_name: rec.entreprises?.name || 'Entreprise',
        company_logo: rec.entreprises?.logo_url || null,
      }));

      // Mettre à jour l'état local
      setStagiaire(prev => {
        if (!prev) return null;
        return { ...prev, recommendations: formattedData };
      });

      return formattedData;
    } catch (error: any) {
      console.error('Erreur lors du chargement des recommandations:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du chargement des recommandations",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  // Fonction de simulation pour le développement
  const useMockData = import.meta.env.DEV && !stagiaireId;

  useEffect(() => {
    if (useMockData) {
      console.log("Utilisation de données fictives pour le développement");
      
      // Données fictives de stagiaire
      const mockStagiaire: StagiaireData = {
        id: "mock-id-1",
        name: "Sophie Martin",
        email: "sophie.martin@example.com",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
        title: "Étudiante en informatique",
        summary: "Passionnée par le développement web et la data science, je cherche un stage pour mettre en pratique mes compétences.",
        looking_for_internship: true,
        skills: ["React", "TypeScript", "Python", "UI/UX Design", "Node.js"],
        languages: ["Français (natif)", "Anglais (C1)", "Espagnol (B1)"],
        bio: "Étudiante en Master d'Informatique à l'Université de Lyon, je suis passionnée par les technologies web modernes et l'analyse de données. J'ai participé à plusieurs hackathons et j'ai développé des projets personnels en React et Python.",
        location: "Lyon, France",
        phone: "+33 6 12 34 56 78",
        disponibility: "Disponible immédiatement",
        education: [
          {
            school: "Université de Lyon",
            degree: "Master",
            field: "Informatique, spécialité IA",
            start_date: "2022-09",
            end_date: null,
            description: "Spécialisation en intelligence artificielle et développement web."
          },
          {
            school: "IUT de Lyon",
            degree: "BUT",
            field: "Informatique",
            start_date: "2019-09",
            end_date: "2022-06",
            description: "Formation généraliste en informatique avec projets pratiques."
          }
        ],
        experience: [
          {
            company: "TechStart",
            position: "Développeuse frontend (stage)",
            start_date: "2022-05",
            end_date: "2022-08",
            description: "Développement d'interfaces utilisateur en React. Mise en place de tests automatisés. Collaboration dans une équipe agile."
          },
          {
            company: "Association CodeForAll",
            position: "Bénévole",
            start_date: "2021-01",
            end_date: null,
            description: "Animation d'ateliers d'initiation à la programmation pour les jeunes défavorisés."
          }
        ],
        projects: [
          {
            title: "Plateforme d'apprentissage en ligne",
            description: "Application web permettant aux enseignants de créer des cours interactifs avec évaluation automatique.",
            url: "https://github.com/sophiemartin/elearn-platform",
            image_url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            tags: ["React", "Node.js", "MongoDB"],
            technologies: ["React", "Node.js", "MongoDB"]
          },
          {
            title: "Analyse de sentiment sur Twitter",
            description: "Projet d'analyse de données utilisant Python et des techniques de NLP pour analyser le sentiment des tweets.",
            url: "https://github.com/sophiemartin/twitter-sentiment",
            image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            tags: ["Python", "NLP", "Data Science"],
            technologies: ["Python", "NLTK", "Pandas", "Matplotlib"]
          }
        ],
        cv_url: "https://example.com/cv/sophie-martin.pdf",
        social_links: {
          linkedin: "https://linkedin.com/in/sophiemartin",
          github: "https://github.com/sophiemartin",
          twitter: "https://twitter.com/sophiemartin",
          website: "https://sophiemartin.dev"
        },
        preferred_locations: ["Lyon", "Paris", "Remote"],
        availability_date: "2023-06-01",
        internship_duration: "3 mois",
        recommendations: [],
        is_premium: true,
        is_verified: true,
        last_active: new Date().toISOString(),
      };
      
      console.log("Fetching recommendations for stagiaire ID:", stagiaireId);
      
      // Simuler des recommandations
      const mockRecommendations: Recommendation[] = [
        {
          id: "rec1",
          entreprise_id: "ent1",
          stagiaire_id: "mock-id-1",
          position: "Développeuse frontend",
          department: "Équipe produit",
          period: "Mai - Août 2022",
          content: "Sophie a été une stagiaire exceptionnelle. Elle a démontré une grande capacité d'apprentissage et une forte motivation. Ses compétences en React et TypeScript ont été très appréciées par l'équipe.",
          rating: 5,
          author_name: "Jean Dupont",
          author_position: "CTO",
          company_name: "TechSolutions",
          company_logo: "https://placehold.co/100",
          created_at: "2023-07-01",
          start_date: "2023-01-01",
          end_date: "2023-06-30",
          updated_at: "2023-07-01",
          is_public: true,
          skills: ["React", "TypeScript", "Communication"],
          achievements: ["Développement d'une interface utilisateur complète", "Optimisation des performances"]
        },
        {
          id: "rec2",
          entreprise_id: "ent2",
          stagiaire_id: "mock-id-1",
          position: "Développeuse data",
          department: "Data Science",
          period: "Septembre - Décembre 2022",
          content: "Une excellente collaboratrice, capable de s'adapter rapidement à de nouveaux environnements. Ses analyses ont été précieuses pour notre équipe.",
          rating: 4,
          author_name: "Marie Robert",
          author_position: "Lead Data Scientist",
          company_name: "InnovCorp",
          company_logo: "https://placehold.co/100",
          created_at: "2023-01-15",
          start_date: "2022-09-01",
          end_date: "2022-12-31",
          updated_at: "2023-01-15",
          is_public: true,
          skills: ["Python", "Data Analysis", "Teamwork"],
          achievements: ["Analyse de données complexes", "Présentation des résultats à l'équipe de direction"]
        }
      ];
      
      // Mettre à jour l'état avec les données simulées
      setStagiaire({
        ...mockStagiaire,
        recommendations: mockRecommendations
      });
      
      setLoading(false);
    }
  }, [useMockData, stagiaireId]);

  return {
    stagiaire,
    loading,
    error,
    updateStagiaire,
    addRecommendation,
    uploadAvatar,
    uploadCV,
    fetchRecommendations
  };
}
