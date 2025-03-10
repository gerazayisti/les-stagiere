
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AboutTab } from '@/components/profile/AboutTab';
import { CVTab } from '@/components/profile/CVTab';
import { Recommendations } from '@/components/profile/Recommendations';
import Portfolio from '@/components/profile/Portfolio';
import { useStagiaire } from '@/hooks/useStagiaire';
import { useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function ProfilStagiaire() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("about");
  const { stagiaire, loading, error } = useStagiaire(id);
  const { user } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }
  
  if (error) {
    toast.error("Erreur lors du chargement du profil");
    return <Navigate to="/404" />;
  }
  
  if (!stagiaire) {
    return <Navigate to="/404" />;
  }
  
  const isCurrentUser = user?.id === stagiaire.id;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <ProfileHeader 
        name={stagiaire.name}
        title={stagiaire.title || "Stagiaire"}
        avatar={stagiaire.avatar_url}
        coverImage="https://images.unsplash.com/photo-1504805572947-34fad45aed93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        isCurrentUser={isCurrentUser}
        profileType="stagiaire"
        userId={stagiaire.id}
      />
      
      <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="cv">CV & Documents</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>
        <TabsContent value="about">
          <AboutTab 
            stagiaire={stagiaire} 
            isCurrentUser={isCurrentUser} 
          />
        </TabsContent>
        <TabsContent value="cv">
          <CVTab 
            stagiaire={stagiaire} 
            isCurrentUser={isCurrentUser} 
          />
        </TabsContent>
        <TabsContent value="portfolio">
          <Portfolio />
        </TabsContent>
        <TabsContent value="recommendations">
          <Recommendations 
            targetId={stagiaire.id} 
            targetType="stagiaire" 
            canAddRecommendation={user?.role === 'entreprise' && user?.id !== stagiaire.id} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
