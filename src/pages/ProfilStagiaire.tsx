
import { useState } from "react";
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

export default function ProfilStagiaire() {
  const { id } = useParams();
  const { isOwner } = useProfile({
    id: id!,
    type: 'stagiaire'
  });
  const { stagiaire, loading, error, updateStagiaire, uploadAvatar, uploadCV } = useStagiaire(id!);
  const [activeTab, setActiveTab] = useState<"profile" | "cv" | "portfolio" | "recommendations">("profile");
  const [isEditing, setIsEditing] = useState(false);

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
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadAvatar(file);
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'avatar:', error);
    }
  };

  const handleCVUpload = async (file: File) => {
    try {
      await uploadCV(file);
    } catch (error) {
      console.error('Erreur lors du téléchargement du CV:', error);
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
          <Recommendations 
            recommendations={stagiaire.recommendations || []} 
            isOwner={isOwner}
            stagiaireId={stagiaire.id}
          />
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
