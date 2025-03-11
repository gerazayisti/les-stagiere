
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AboutTab } from '@/components/profile/AboutTab';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import AddInternshipOfferForm from '@/components/profile/AddInternshipOfferForm';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import { InternshipOffersList } from '@/components/profile/InternshipOffersList';
import { CompanyRecommendations } from '@/components/profile/CompanyRecommendations';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EditEntrepriseDialog } from '@/components/profile/EditEntrepriseDialog';

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
  
  // Chargement progressif - charger d'abord les données de base
  useEffect(() => {
    async function loadBasicData() {
      try {
        if (!id) return;
        
        console.log("Charging basic entreprise data for ID:", id);
        
        // Essayer d'abord d'obtenir depuis le cache pour une réponse UI immédiate
        const cachedData = localStorage.getItem(`cachedCompanyProfile_${id}`);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          // Utiliser le cache s'il a moins de 5 minutes
          if (Date.now() - timestamp < 300000) {
            console.log("Using cached company profile");
            setEntreprise(data);
            setHeaderLoaded(true);
          }
        }
        
        // Peu importe si nous avons chargé depuis le cache, charger depuis la DB
        fetchEnterpriseData();
      } catch (err) {
        console.error('Erreur initiale:', err);
      }
    }
    
    loadBasicData();
  }, [id]);
  
  async function fetchEnterpriseData() {
    try {
      if (!id) return;
      
      // Vérifier si l'utilisateur connecté est cette entreprise
      const isCurrentUserCompany = user && user.id === id && user.role === 'entreprise';
      
      console.log("Fetching full entreprise data with ID:", id);
      
      // Correction du bug: utiliser .eq() au lieu de passer un paramètre id dans select()
      let { data, error: fetchError } = await supabase
        .from('entreprises')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error("Fetch error:", fetchError);
        
        // Si l'entreprise n'existe pas et que l'utilisateur connecté est cette entreprise
        if (isCurrentUserCompany) {
          console.log("Creating company profile for user:", user.id);
          setIsCreatingProfile(true);
          
          // Créer le profil de l'entreprise
          const { error: createError } = await supabase
            .from('entreprises')
            .upsert({
              id: user.id,
              name: user.name || 'Entreprise',
              email: user.email,
              logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'E')}&background=random`,
              is_verified: false,
              created_at: new Date().toISOString()
            });
            
          if (createError) {
            throw createError;
          }
          
          // Récupérer le profil nouvellement créé
          const { data: newData, error: newFetchError } = await supabase
            .from('entreprises')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (newFetchError) {
            throw newFetchError;
          }
          
          data = newData;
          
          // Mettre en cache le profil
          localStorage.setItem(`cachedCompanyProfile_${id}`, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
          
          setIsCreatingProfile(false);
        } else {
          throw fetchError;
        }
      } else if (data) {
        // Mettre en cache le profil
        localStorage.setItem(`cachedCompanyProfile_${id}`, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      }
      
      setEntreprise(data);
      setHeaderLoaded(true);
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement de l\'entreprise:', err);
      setError(err.message);
      setLoading(false);
      toast.error('Impossible de charger le profil de l\'entreprise');
    }
  }
  
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
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="offers">Offres de stage</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
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
          
          <InternshipOffersList companyId={entreprise.id} />
          
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
      </Tabs>
      
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
