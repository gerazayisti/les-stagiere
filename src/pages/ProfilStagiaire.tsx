import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InteractiveCV } from "@/components/profile/InteractiveCV";
import { Portfolio } from "@/components/profile/Portfolio";
import { Recommendations } from "@/components/profile/Recommendations";
import { CVManager } from "@/components/profile/CVManager";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { Badge } from "@/components/profile/Badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Briefcase, ThumbsUp, Lock, User, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useProfile } from '@/hooks/useProfile';
import { useStagiaire } from '@/hooks/useStagiaire';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={stagiaire.avatar_url} />
            <AvatarFallback>{stagiaire.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-bold">{stagiaire.name}</h1>
              {stagiaire.is_premium && (
                <Badge variant="premium" />
              )}
            </div>
            <p className="text-muted-foreground">{stagiaire.title}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{stagiaire.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span>{stagiaire.education}</span>
              </div>
              {stagiaire.disponibility && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>{stagiaire.disponibility}</span>
                </div>
              )}
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Modifier le profil
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Onglets */}
      <Tabs defaultValue={activeTab} className="space-y-6" onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="cv">CV</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">À propos</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{stagiaire.bio}</p>

            {stagiaire.skills && stagiaire.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Compétences</h3>
                <div className="flex flex-wrap gap-2">
                  {stagiaire.skills.map((skill, index) => (
                    <Badge key={index}>{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {stagiaire.languages && stagiaire.languages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Langues</h3>
                <div className="flex flex-wrap gap-2">
                  {stagiaire.languages.map((language, index) => (
                    <Badge key={index} variant="outline">{language}</Badge>
                  ))}
                </div>
              </div>
            )}

            {stagiaire.preferred_locations && stagiaire.preferred_locations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Localisations préférées</h3>
                <div className="flex flex-wrap gap-2">
                  {stagiaire.preferred_locations.map((location, index) => (
                    <Badge key={index} variant="secondary">{location}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="cv">
          <Card className="p-6">
            {isOwner ? (
              <CVManager onUpload={handleCVUpload} cvUrl={stagiaire.cv_url} />
            ) : (
              <InteractiveCV cvUrl={stagiaire.cv_url} />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="portfolio">
          <Portfolio projects={stagiaire.projects || []} isOwner={isOwner} />
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
