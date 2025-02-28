
import { useState, useEffect } from "react";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { useParams } from "react-router-dom";
import { useProfile } from '@/hooks/useProfile';
import { useStagiaire } from '@/hooks/useStagiaire';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AboutTab } from "@/components/profile/AboutTab";
import { CVTab } from "@/components/profile/CVTab";
import { Portfolio } from "@/components/profile/Portfolio";
import { Recommendations } from "@/components/profile/Recommendations";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilStagiaire() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const isOwner = user?.id === id;
  
  const { stagiaire, loading, error, updateStagiaire, uploadAvatar, uploadCV, fetchRecommendations } = useStagiaire(id!);
  
  const [activeTab, setActiveTab] = useState<"profile" | "cv" | "portfolio" | "recommendations">("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Charger les recommandations quand on passe à cet onglet
  useEffect(() => {
    if (activeTab === "recommendations") {
      fetchRecommendations().catch(err => {
        console.error("Erreur lors du chargement des recommandations:", err);
      });
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !stagiaire) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Erreur</h1>
          <p className="text-gray-600">{error || "Profil non trouvé"}</p>
        </Card>
      </div>
    );
  }

  const handleEditSubmit = async (data: any) => {
    try {
      await updateStagiaire(data);
      setIsEditing(false);
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadAvatar(file);
      toast({
        title: "Succès",
        description: "Avatar mis à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'avatar:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'avatar",
        variant: "destructive",
      });
    }
  };

  const handleCVUpload = async (file: File) => {
    try {
      await uploadCV(file);
      toast({
        title: "Succès",
        description: "CV mis à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement du CV:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le CV",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête du profil */}
      <ProfileHeader 
        stagiaire={stagiaire} 
        isOwner={isOwner} 
        onEditClick={() => setIsEditing(true)} 
      />

      {/* Onglets */}
      <Tabs defaultValue={activeTab} className="space-y-6" onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="cv">CV</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <AboutTab 
            bio={stagiaire.bio} 
            skills={stagiaire.skills || []} 
            languages={stagiaire.languages || []} 
            preferredLocations={stagiaire.preferred_locations || []}
          />
        </TabsContent>

        <TabsContent value="cv">
          <CVTab 
            isOwner={isOwner} 
            cvUrl={stagiaire.cv_url} 
            onUpload={handleCVUpload}
          />
        </TabsContent>

        <TabsContent value="portfolio">
          <Portfolio 
            projects={stagiaire.projects || []} 
            isOwner={isOwner} 
          />
        </TabsContent>

        <TabsContent value="recommendations">
          {stagiaire.recommendations && (
            <Recommendations 
              recommendations={stagiaire.recommendations}
              isOwner={isOwner}
              stagiaireId={stagiaire.id}
              isPremium={stagiaire.is_premium}
            />
          )}
        </TabsContent>
      </Tabs>

      {isEditing && (
        <EditProfileForm
          initialData={stagiaire}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
          onAvatarUpload={handleAvatarUpload}
        />
      )}
    </div>
  );
}
