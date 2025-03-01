import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { StagiaireData, EditProfileForm } from "@/components/profile/EditProfileForm";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ProfilStagiaire() {
  const { user, loading, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<StagiaireData | null>(null);

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

          setProfileData(data as StagiaireData);
        } catch (error: any) {
          console.error("Error fetching profile:", error.message);
          toast.error("Failed to load profile data.");
        }
      }
    };

    fetchProfile();
  }, [user, isAuthenticated]);

  const updateProfile = async (data: Partial<StagiaireData>) => {
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('stagiaires')
          .update(data)
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        setProfileData({ ...profileData, ...data } as StagiaireData);
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
      setProfileData(prevData => ({ ...prevData, avatar_url } as StagiaireData));

      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      console.error("Error uploading avatar:", error.message);
      toast.error("Failed to upload avatar.");
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
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Profil Stagiaire</h1>

      {profileData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Consultez et modifiez vos informations personnelles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    {profileData.avatar_url ? (
                      <AvatarImage src={profileData.avatar_url} alt={profileData.name} />
                    ) : (
                      <AvatarFallback>{profileData.name?.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold">{profileData.name}</h2>
                    <p className="text-sm text-muted-foreground">{profileData.title}</p>
                  </div>
                </div>

                <dl className="space-y-2">
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
                  <div>
                    <dt className="text-sm font-medium">Formation</dt>
                    <dd className="text-sm text-muted-foreground">{profileData.education}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium">Disponibilité</dt>
                    <dd className="text-sm text-muted-foreground">{profileData.disponibility}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium">Bio</dt>
                    <dd className="text-sm text-muted-foreground">{profileData.bio}</dd>
                  </div>
                </dl>

                <Button onClick={() => setIsEditing(true)}>
                  Modifier le profil
                </Button>
              </CardContent>
            </Card>
          </div>

          {isEditing && (
            <div>
              <Card>
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
        </div>
      ) : (
        <div className="text-center py-8">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Chargement des informations du profil...</p>
        </div>
      )}
    </div>
  );
}
