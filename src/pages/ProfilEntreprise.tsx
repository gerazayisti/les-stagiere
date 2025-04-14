import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AboutTab } from '@/components/profile/AboutTab';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import AddInternshipOfferForm from '@/components/profile/AddInternshipOfferForm';
import { StageDetailsModal } from '@/components/profile/StageDetailsModal';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import { InternshipOffersList } from '@/components/profile/InternshipOffersList';
import { CompanyRecommendations } from '@/components/profile/CompanyRecommendations';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EditEntrepriseDialog } from '@/components/profile/EditEntrepriseDialog';
import { EntrepriseCandidatures } from '@/components/candidatures/EntrepriseCandidatures';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

// Fonction de mise en cache améliorée
const cacheCompanyProfile = (id: string, data: any) => {
  try {
    localStorage.setItem(`cachedCompanyProfile_${id}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Erreur de mise en cache:', error);
  }
};

// Fonction de récupération du cache améliorée
const getCachedCompanyProfile = (id: string) => {
  try {
    const cachedData = localStorage.getItem(`cachedCompanyProfile_${id}`);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // Cache valide pendant 15 minutes
      return (Date.now() - timestamp < 15 * 60 * 1000) ? data : null;
    }
  } catch (error) {
    console.warn('Erreur de lecture du cache:', error);
  }
  return null;
};

export default function ProfilEntreprise() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("about");
  const { user } = useAuth();
  const [entreprise, setEntreprise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [headerLoaded, setHeaderLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddOfferModalOpen, setIsAddOfferModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  
  const [stages, setStages] = useState<any[]>([]);
  const [selectedStage, setSelectedStage] = useState<any | null>(null);
  const [isStageDetailsModalOpen, setIsStageDetailsModalOpen] = useState(false);
  const { resetTimeout } = useSessionTimeout();

  // Reset session timeout on component mount
  useEffect(() => {
    resetTimeout();
  }, [resetTimeout]);

  // Fonction de chargement des données de l'entreprise avec optimisation
  const fetchEnterpriseData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      // Vérifier d'abord le cache
      const cachedProfile = getCachedCompanyProfile(id);
      if (cachedProfile) {
        setEntreprise(cachedProfile);
        setHeaderLoaded(true);
        setLoading(false);
        return;
      }

      // Requête Supabase avec sélection optimisée
      const { data, error: fetchError } = await supabase
        .from('entreprises')
        .select(`
          *,
          stages (
            id,
            title,
            description,
            location,
            type,
            status,
            is_urgent,
            start_date,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error("Erreur de chargement:", fetchError);
        setError(fetchError.message);
        
        // Gérer la création de profil pour l'utilisateur connecté
        if (user?.id === id && user?.role === 'entreprise') {
          await createCompanyProfile();
        }
      } else if (data) {
        // Mise en cache du profil
        cacheCompanyProfile(id, data);
        setEntreprise(data);
        setHeaderLoaded(true);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err);
      setError(err.message || 'Erreur de chargement');
      toast.error('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  // Création du profil d'entreprise
  const createCompanyProfile = async () => {
    try {
      const { error: createError } = await supabase
        .from('entreprises')
        .upsert({
          id: user?.id,
          name: user?.name || 'Entreprise',
          email: user?.email,
          logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'E')}&background=random`,
          created_at: new Date().toISOString()
        });

      if (createError) {
        throw createError;
      }

      // Rechargement des données après création
      await fetchEnterpriseData();
    } catch (error) {
      console.error('Erreur de création de profil:', error);
      toast.error('Impossible de créer le profil');
    }
  };

  // Effet pour charger les données
  useEffect(() => {
    fetchEnterpriseData();
  }, [fetchEnterpriseData]);

  // Charger les stages de l'entreprise
  useEffect(() => {
    if (entreprise?.id) {
      fetchCompanyStages();
    }
  }, [entreprise?.id]);

  const fetchCompanyStages = async () => {
    try {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('entreprise_id', entreprise.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setStages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des stages:', error);
      toast.error('Impossible de charger les offres de stage');
    }
  };

  const handleStageDetailsOpen = (stage: any) => {
    setSelectedStage(stage);
    setIsStageDetailsModalOpen(true);
  };

  const handleStageUpdate = (updatedStage: any) => {
    // Mettre à jour la liste des stages
    const updatedStages = stages.map(stage => 
      stage.id === updatedStage.id ? updatedStage : stage
    );
    setStages(updatedStages);
    
    // Fermer le modal
    setIsStageDetailsModalOpen(false);
  };

  // Rendu d'un squelette pendant le chargement des données de base
  if (!headerLoaded) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex justify-center mt-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (loading && isCreatingProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Création de votre profil...</p>
        </div>
      </div>
    );
  }
  
  if (error || !entreprise) {
    return <Navigate to="/" />;
  }
  
  const isCurrentUser = user?.id === entreprise.id;
  
  const handleAddOffer = (offerData: any) => {
    console.log('Ajout d\'une offre:', offerData);
    toast.success('Offre de stage ajoutée avec succès!');
    setIsAddOfferModalOpen(false);
  };
  
  const handleProfileUpdate = () => {
    fetchEnterpriseData();
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <ProfileHeader 
        name={entreprise.name}
        avatarUrl={entreprise.logo_url}
        bio={entreprise.description || ""}
        location={entreprise.location || ""}
        socials={{
          website: entreprise.website || "",
          github: entreprise.social_media?.github || "",
          linkedin: entreprise.social_media?.linkedin || ""
        }}
        editable={isCurrentUser}
        onEdit={() => setIsEditProfileModalOpen(true)}
      />
      
      <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="offers">Offres de stage</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          {isCurrentUser && (
            <TabsTrigger value="candidatures">Candidatures</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="about">
          <div className="flex justify-end mb-4">
            {isCurrentUser && (
              <Button variant="outline" size="sm" onClick={() => setIsEditProfileModalOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier le profil
              </Button>
            )}
          </div>
          <AboutTab 
            bio={entreprise.description || ""}
            education={entreprise.industry || ""}
            isPremium={entreprise.is_premium}
            userId={entreprise.id}
            extraInfos={[
              { label: "Secteur", value: entreprise.industry || "Non spécifié" },
              { label: "Taille", value: entreprise.size || "Non spécifiée" },
              { label: "Fondée en", value: entreprise.founded_year || "Non spécifié" },
              { label: "Site web", value: entreprise.website || "Non spécifié", isLink: true },
            ]}
            culture={entreprise.company_culture}
            benefits={entreprise.benefits}
          />
        </TabsContent>
        <TabsContent value="offers">
          <div className="mb-6">
            {isCurrentUser && (
              <Button onClick={() => setIsAddOfferModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une offre de stage
              </Button>
            )}
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Offres de stage</h2>
              {isCurrentUser && (
                <Button 
                  onClick={() => setIsAddOfferModalOpen(true)} 
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Ajouter une offre
                </Button>
              )}
            </div>
            
            <InternshipOffersList 
              companyId={entreprise.id} 
              onStageSelect={handleStageDetailsOpen}
            />
          </div>
          
          {isAddOfferModalOpen && (
            <AddInternshipOfferForm
              isOpen={isAddOfferModalOpen}
              onClose={() => setIsAddOfferModalOpen(false)}
              onSave={handleAddOffer}
            />
          )}
        </TabsContent>
        <TabsContent value="recommendations">
          <CompanyRecommendations 
            userId={user?.id || ""}
            companyId={entreprise.id}
            companyName={entreprise.name}
            companyLogo={entreprise.logo_url}
            isPremium={entreprise.is_premium}
          />
        </TabsContent>
        {isCurrentUser && (
          <TabsContent value="candidatures">
            <EntrepriseCandidatures />
          </TabsContent>
        )}
      </Tabs>
      
      {selectedStage && (
        <StageDetailsModal
          isOpen={isStageDetailsModalOpen}
          onClose={() => setIsStageDetailsModalOpen(false)}
          stage={selectedStage}
          onUpdate={handleStageUpdate}
        />
      )}
      
      {isEditProfileModalOpen && (
        <EditEntrepriseDialog
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          entrepriseId={entreprise.id}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}
