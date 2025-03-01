
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { StagiaireData, EditProfileForm } from "@/components/profile/EditProfileForm";
import { Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AboutTab } from "@/components/profile/AboutTab";
import { CVTab } from "@/components/profile/CVTab";
import { Portfolio } from "@/components/profile/Portfolio";
import { CompanyRecommendations } from "@/components/profile/CompanyRecommendations";

// Extend StagiaireData to include avatar_url
interface ExtendedStagiaireData extends StagiaireData {
  avatar_url?: string;
}

export default function ProfilStagiaire() {
  const { user, loading, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ExtendedStagiaireData | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const { data, error } = await supabase
            .from('stagiaires')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            throw error;
          }

          setProfileData(data as ExtendedStagiaireData);
        } catch (error: any) {
          console.error("Error fetching profile:", error.message);
          toast.error("Failed to load profile data.");
        }
      }
    };

    fetchProfile();
  }, [user, isAuthenticated]);

  const updateProfile = async (data: Partial<ExtendedStagiaireData>) => {
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('stagiaires')
          .update(data)
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        setProfileData({ ...profileData, ...data } as ExtendedStagiaireData);
        toast.success("Profile updated successfully!");
      } catch (error: any) {
        console.error("Error updating profile:", error.message);
        toast.error("Failed to update profile.");
      }
    }
  };

  const handleProfileUpdate = (data: Partial<StagiaireData>) => {
    updateProfile(data);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      const filePath = `avatars/${user.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: storageData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!storageData?.publicUrl) {
        throw new Error("Failed to retrieve public URL for avatar.");
      }

      const avatar_url = storageData.publicUrl;

      // Update the user's profile with the new avatar URL
      await updateProfile({ avatar_url });
      setProfileData(prevData => ({ ...prevData, avatar_url } as ExtendedStagiaireData));

      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      console.error("Error uploading avatar:", error.message);
      toast.error("Failed to upload avatar.");
    }
  };

  const handleMessageButtonClick = async (entrepriseId: string) => {
    try {
      // Vérifier si une conversation existe déjà
      const { data: existingConversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .or(`sender_id.eq.${entrepriseId},receiver_id.eq.${entrepriseId}`);
      
      if (convError) throw convError;
      
      let conversationId;
      
      if (existingConversations && existingConversations.length > 0) {
        // Utiliser la conversation existante
        conversationId = existingConversations[0].id;
      } else {
        // Créer une nouvelle conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            sender_id: user?.id,
            receiver_id: entrepriseId,
            last_message: 'Nouvelle conversation',
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (createError) throw createError;
        conversationId = newConversation.id;
      }
      
      // Rediriger vers la messagerie avec l'ID de conversation
      navigate(`/messagerie?conversation=${conversationId}`);
      
    } catch (error: any) {
      console.error("Error initiating conversation:", error.message);
      toast.error("Impossible d'initier la conversation.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Vous devez être connecté pour voir votre profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Veuillez vous connecter pour accéder à cette page.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      {profileData ? (
        <>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      {profileData.avatar_url ? (
                        <AvatarImage src={profileData.avatar_url} alt={profileData.name} />
                      ) : (
                        <AvatarFallback>{profileData.name?.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <h2 className="text-2xl font-bold">{profileData.name}</h2>
                    <p className="text-muted-foreground">{profileData.title}</p>
                    <div className="flex items-center mt-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {profileData.disponibility === 'immediate' ? 'Disponible immédiatement' : 'Disponible prochainement'}
                      </span>
                    </div>
                    <div className="mt-4 w-full">
                      <Button 
                        className="w-full" 
                        onClick={() => setIsEditing(true)}
                      >
                        Modifier le profil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Coordonnées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium">Email</dt>
                    <dd className="text-sm text-muted-foreground">{profileData.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium">Téléphone</dt>
                    <dd className="text-sm text-muted-foreground">{profileData.phone || "Non spécifié"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium">Localisation</dt>
                    <dd className="text-sm text-muted-foreground">{profileData.location}</dd>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="w-full lg:w-2/3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start mb-4">
                  <TabsTrigger value="about">À propos</TabsTrigger>
                  <TabsTrigger value="cv">CV</TabsTrigger>
                  <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about">
                  <AboutTab 
                    bio={profileData.bio} 
                    education={profileData.education}
                    disponibility={profileData.disponibility}
                  />
                </TabsContent>
                
                <TabsContent value="cv">
                  <CVTab userId={user.id} />
                </TabsContent>
                
                <TabsContent value="portfolio">
                  <Portfolio userId={user.id} />
                </TabsContent>
                
                <TabsContent value="recommendations">
                  <CompanyRecommendations 
                    userId={user.id}
                    onMessageClick={handleMessageButtonClick}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {isEditing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Modifier le profil</CardTitle>
                  <CardDescription>
                    Modifiez vos informations personnelles.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EditProfileForm
                    initialData={profileData}
                    onSubmit={handleProfileUpdate}
                    onCancel={() => setIsEditing(false)}
                    onAvatarUpload={handleAvatarUpload}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Chargement des informations du profil...</p>
        </div>
      )}
    </div>
  );
}
