
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from '@/components/profile/ProfileHeader';
import AboutTab from '@/components/profile/AboutTab';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import AddInternshipOfferForm from '@/components/profile/AddInternshipOfferForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import InternshipOffersList from '@/components/profile/InternshipOffersList';
import CompanyRecommendations from '@/components/profile/CompanyRecommendations';
import { supabase } from '@/lib/supabase';

export default function ProfilEntreprise() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("about");
  const { user } = useAuth();
  const [entreprise, setEntreprise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOfferModalOpen, setIsAddOfferModalOpen] = useState(false);
  
  // Charger les données de l'entreprise
  useState(() => {
    async function fetchEntreprise() {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from('entreprises')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setEntreprise(data);
      } catch (err: any) {
        console.error('Erreur lors du chargement de l\'entreprise:', err);
        setError(err.message);
        toast.error('Impossible de charger le profil de l\'entreprise');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEntreprise();
  }, [id]);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }
  
  if (error || !entreprise) {
    return <Navigate to="/404" />;
  }
  
  const isCurrentUser = user?.id === entreprise.id;
  
  const handleAddOffer = (offerData: any) => {
    // Implémentation pour ajouter une offre
    console.log('Ajout d\'une offre:', offerData);
    toast.success('Offre de stage ajoutée avec succès!');
    setIsAddOfferModalOpen(false);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <ProfileHeader 
        name={entreprise.name}
        title={entreprise.industry || "Entreprise"}
        avatar={entreprise.logo_url}
        coverImage="https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
        isCurrentUser={isCurrentUser}
        profileType="entreprise"
        userId={entreprise.id}
      />
      
      <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="offers">Offres de stage</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>
        <TabsContent value="about">
          <AboutTab 
            entreprise={entreprise} 
            isCurrentUser={isCurrentUser} 
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
          
          <InternshipOffersList entrepriseId={entreprise.id} isOwner={isCurrentUser} />
          
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
            entrepriseId={entreprise.id} 
            canAddRecommendation={user?.role === 'stagiaire'} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
