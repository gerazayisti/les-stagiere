
import { useState, useEffect } from "react";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { useParams } from "react-router-dom";
import { useStagiaire, StagiaireData } from '@/hooks/useStagiaire';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AboutTab } from "@/components/profile/AboutTab";
import { CVTab } from "@/components/profile/CVTab";
import { Portfolio } from "@/components/profile/Portfolio";
import { Recommendations } from "@/components/profile/Recommendations";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Recommendation } from "@/types/recommendations";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilStagiaire() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const isOwner = user?.id === id;
  
  const { stagiaire, loading, error, updateStagiaire, uploadAvatar, uploadCV, fetchRecommendations } = useStagiaire(id || "");
  
  const [activeTab, setActiveTab] = useState<"profile" | "cv" | "portfolio" | "recommendations">("profile");
  const [isEditing, setIsEditing] = useState(false);
  
  // Charger les recommandations quand on passe à cet onglet
  useEffect(() => {
    if (activeTab === "recommendations" && fetchRecommendations) {
      fetchRecommendations().catch(err => {
        console.error("Erreur lors du chargement des recommandations:", err);
        toast({
          title: "Erreur",
          description: "Impossible de charger les recommandations",
          variant: "destructive",
        });
      });
    }
  }, [activeTab, fetchRecommendations, toast]);

  // Page de chargement complète
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">Chargement du profil...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Page d'erreur complète
  if (error || !stagiaire) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600 flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Erreur
            </CardTitle>
            <CardDescription className="text-base">
              {error || "Ce profil n'existe pas ou n'est plus disponible."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Vous pouvez essayer de :
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Vérifier l'URL et réessayer</li>
              <li>Revenir à la page d'accueil</li>
              <li>Contacter l'administrateur si le problème persiste</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEditSubmit = async (data: Partial<StagiaireData>) => {
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
      {/* En-tête du profil avec gestion des erreurs */}
      <ProfileHeader 
        stagiaire={stagiaire} 
        isOwner={isOwner} 
        onEditClick={() => setIsEditing(true)}
        loading={loading}
        error={error}
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
          {stagiaire.bio || stagiaire.skills || stagiaire.languages || stagiaire.preferred_locations ? (
            <AboutTab 
              bio={stagiaire.bio || ""} 
              skills={stagiaire.skills || []} 
              languages={stagiaire.languages || []} 
              preferredLocations={stagiaire.preferred_locations || []}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Aucune information de profil n'est disponible.
                    {isOwner && " Cliquez sur 'Modifier le profil' pour ajouter des informations."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
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
          {stagiaire.recommendations && stagiaire.recommendations.length > 0 ? (
            <Recommendations 
              recommendations={stagiaire.recommendations as Recommendation[]}
              isOwner={isOwner}
              stagiaireId={stagiaire.id}
              isPremium={stagiaire.is_premium || false}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Aucune recommandation n'est disponible pour le moment.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {isEditing && (
        <EditProfileForm
          initialData={{
            name: stagiaire.name,
            title: stagiaire.title || "",
            location: stagiaire.location || "",
            bio: stagiaire.bio || "",
            email: stagiaire.email,
            phone: stagiaire.phone || "",
            education: typeof stagiaire.education === 'string' ? stagiaire.education : "",
            disponibility: stagiaire.disponibility || ""
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
