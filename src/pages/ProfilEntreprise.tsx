
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AboutTab } from '@/components/profile/AboutTab';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import AddInternshipOfferForm from '@/components/profile/AddInternshipOfferForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InternshipOffersList } from '@/components/profile/InternshipOffersList';
import { CompanyRecommendations } from '@/components/profile/CompanyRecommendations';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ProfilEntreprise() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("about");
  const { user } = useAuth();
  const [entreprise, setEntreprise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOfferModalOpen, setIsAddOfferModalOpen] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  
  useEffect(() => {
    async function fetchEntreprise() {
      try {
        if (!id) return;
        
        console.log("Fetching entreprise with ID:", id);
        setLoading(true);
        
        // First try to get from cache for immediate UI response
        const cachedData = localStorage.getItem(`cachedCompanyProfile_${id}`);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          // Use cache if it's less than 5 minutes old
          if (Date.now() - timestamp < 300000) {
            console.log("Using cached company profile");
            setEntreprise(data);
            setLoading(false);
            
            // Still fetch in background to update cache
            fetchFromDatabase();
            return;
          }
        }
        
        // No valid cache, fetch from database
        await fetchFromDatabase();
        
      } catch (err: any) {
        console.error('Erreur lors du chargement de l\'entreprise:', err);
        setError(err.message);
        toast.error('Impossible de charger le profil de l\'entreprise');
        setLoading(false);
      }
    }
    
    async function fetchFromDatabase() {
      try {
        const { data, error } = await supabase
          .from('entreprises')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          // If company doesn't exist, check if the logged-in user is this company
          if (error.code === 'PGRST116' && user && user.id === id && user.role === 'entreprise') {
            console.log("Creating company profile for user:", user.id);
            setIsCreatingProfile(true);
            
            // Create the company profile
            const { data: createdData, error: createError } = await supabase
              .from('entreprises')
              .upsert({
                id: user.id,
                name: user.name || 'Entreprise',
                email: user.email,
                logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'E')}&background=random`,
                is_verified: false,
                created_at: new Date().toISOString()
              }, { onConflict: 'id' });
              
            if (createError) {
              throw createError;
            }
            
            // Fetch the newly created profile
            const { data: newData, error: fetchError } = await supabase
              .from('entreprises')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (fetchError) {
              throw fetchError;
            }
            
            setEntreprise(newData);
            
            // Cache the profile
            localStorage.setItem(`cachedCompanyProfile_${id}`, JSON.stringify({
              data: newData,
              timestamp: Date.now()
            }));
            
            setIsCreatingProfile(false);
          } else {
            throw error;
          }
        } else {
          setEntreprise(data);
          
          // Cache the profile
          localStorage.setItem(`cachedCompanyProfile_${id}`, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        }
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    }
    
    fetchEntreprise();
  }, [id, user]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>{isCreatingProfile ? "Création de votre profil..." : "Chargement du profil..."}</p>
        </div>
      </div>
    );
  }
  
  if (error || !entreprise) {
    return <Navigate to="/404" />;
  }
  
  const isCurrentUser = user?.id === entreprise.id;
  
  const handleAddOffer = (offerData: any) => {
    console.log('Ajout d\'une offre:', offerData);
    toast.success('Offre de stage ajoutée avec succès!');
    setIsAddOfferModalOpen(false);
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
          github: entreprise.github || "",
          linkedin: entreprise.linkedin || ""
        }}
        editable={isCurrentUser}
        onEdit={() => {}}
      />
      
      <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="offers">Offres de stage</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>
        <TabsContent value="about">
          <AboutTab 
            bio={entreprise.description || ""}
            education={entreprise.industry || ""}
            isPremium={entreprise.is_premium}
            userId={entreprise.id}
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
    </div>
  );
}
