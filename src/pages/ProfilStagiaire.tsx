
import { useState, useEffect } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilStagiaire() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("about");
  const { stagiaire, loading, error } = useStagiaire(id || '');
  const { user } = useAuth();
  const [headerLoaded, setHeaderLoaded] = useState(false);
  
  // Simuler un chargement plus rapide pour les données basiques
  useEffect(() => {
    if (stagiaire) {
      setHeaderLoaded(true);
    } else {
      // Simuler un chargement rapide pour l'en-tête
      const timer = setTimeout(() => {
        setHeaderLoaded(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [stagiaire]);
  
  // Rendu d'un squelette pendant le chargement des données de base
  if (loading && !headerLoaded) {
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
  
  if (loading && headerLoaded) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        <Tabs defaultValue="about" className="mt-8">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="about">À propos</TabsTrigger>
            <TabsTrigger value="cv">CV & Documents</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          </TabsList>
          <TabsContent value="about">
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-16 w-1/2" />
            </div>
          </TabsContent>
        </Tabs>
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
      
  // FIX: Ensure education is properly formatted - accepting the array type instead of string
  const education = Array.isArray(stagiaire.education) ? stagiaire.education : [];
  
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
