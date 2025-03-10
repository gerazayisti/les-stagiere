
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AboutTab } from '@/components/profile/AboutTab';
import { CVTab } from '@/components/profile/CVTab';
import { Recommendations } from '@/components/profile/Recommendations';
import Portfolio from '@/components/profile/Portfolio';
import { useStagiaire } from '@/hooks/useStagiaire';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function ProfilStagiaire() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("about");
  const { stagiaire, loading, error } = useStagiaire(id || '');
  const { user } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    toast.error("Erreur lors du chargement du profil");
    return <Navigate to="/" />;
  }
  
  if (!stagiaire) {
    return <Navigate to="/" />;
  }
  
  const isCurrentUser = user?.id === stagiaire.id;
  
  // Build social objects from available data
  const socials = {
    website: stagiaire.social_links?.website || "",
    github: stagiaire.social_links?.github || "",
    linkedin: stagiaire.social_links?.linkedin || ""
  };
  
  // Ensure proper types for disponibility
  const disponibility = stagiaire.disponibility && 
    (stagiaire.disponibility === "upcoming" || stagiaire.disponibility === "immediate") 
      ? stagiaire.disponibility 
      : "upcoming";
      
  // Ensure education is properly formatted - résolution de l'erreur TypeScript
  const education = stagiaire.education || [];
  
  return (
    <div className="container mx-auto py-8 px-4">
      <ProfileHeader 
        name={stagiaire.name}
        avatarUrl={stagiaire.avatar_url}
        bio={stagiaire.bio || ""}
        location={stagiaire.location || ""}
        socials={socials}
        editable={isCurrentUser}
        onEdit={() => {}}
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
            bio={stagiaire.bio || ""}
            disponibility={disponibility}
            education={education}
            isPremium={stagiaire.is_premium}
            userId={stagiaire.id}
          />
        </TabsContent>
        <TabsContent value="cv">
          <CVTab 
            userId={stagiaire.id}
            isPremium={stagiaire.is_premium}
          />
        </TabsContent>
        <TabsContent value="portfolio">
          <Portfolio />
        </TabsContent>
        <TabsContent value="recommendations">
          <Recommendations 
            recommendations={stagiaire.recommendations || []}
            isOwner={isCurrentUser}
            stagiaireId={stagiaire.id}
            isPremium={stagiaire.is_premium}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
