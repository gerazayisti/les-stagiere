
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { StagiaireData, EditProfileForm } from "@/components/profile/EditProfileForm";
import { Loader2, MessageSquare, Plus, Edit, Trash2, FileText } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Extend StagiaireData to include avatar_url and isPremium flag
interface ExtendedStagiaireData extends StagiaireData {
  avatar_url?: string;
  isPremium?: boolean;
}

// Experience
interface Experience {
  id?: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  skills: string[];
}

// Education
interface Education {
  id?: string;
  degree: string;
  institution: string;
  location: string;
  period: string;
  description: string;
  courses: string[];
}

// Skill
interface Skill {
  name: string;
  level: number;
}

// Language
interface Language {
  name: string;
  level: string;
}

// Certification
interface Certification {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export default function ProfilStagiaire() {
  const { user, loading, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ExtendedStagiaireData | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  const navigate = useNavigate();
  
  // Dummy data for demonstration
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  
  // Modals state
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showCVAnalyzerModal, setShowCVAnalyzerModal] = useState(false);
  
  // Current item being edited
  const [currentExperience, setCurrentExperience] = useState<Experience | null>(null);
  const [currentEducation, setCurrentEducation] = useState<Education | null>(null);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const [currentCertification, setCurrentCertification] = useState<Certification | null>(null);

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
          
          // Fetch all profile data from the appropriate tables
          // This would normally be implemented here
          
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

  // Functions for managing experiences
  const handleAddExperience = () => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    setCurrentExperience(null);
    setShowExperienceModal(true);
  };

  const handleEditExperience = (experience: Experience) => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    setCurrentExperience(experience);
    setShowExperienceModal(true);
  };

  const handleDeleteExperience = (id: string | undefined) => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    if (!id) return;
    // Remove experience logic would go here
    setExperiences(experiences.filter(exp => exp.id !== id));
    toast.success("Expérience supprimée avec succès");
  };

  // Functions for managing education
  const handleAddEducation = () => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    setCurrentEducation(null);
    setShowEducationModal(true);
  };

  const handleEditEducation = (education: Education) => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    setCurrentEducation(education);
    setShowEducationModal(true);
  };

  const handleDeleteEducation = (id: string | undefined) => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    if (!id) return;
    // Remove education logic would go here
    setEducations(educations.filter(edu => edu.id !== id));
    toast.success("Formation supprimée avec succès");
  };

  // Functions for managing skills
  const handleAddSkill = () => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    setCurrentSkill(null);
    setShowSkillModal(true);
  };

  const handleEditSkill = (skill: Skill) => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    setCurrentSkill(skill);
    setShowSkillModal(true);
  };

  const handleDeleteSkill = (name: string) => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    // Remove skill logic would go here
    setSkills(skills.filter(skill => skill.name !== name));
    toast.success("Compétence supprimée avec succès");
  };

  // Functions for managing languages
  const handleAddLanguage = () => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    setCurrentLanguage(null);
    setShowLanguageModal(true);
  };

  const handleEditLanguage = (language: Language) => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    setCurrentLanguage(language);
    setShowLanguageModal(true);
  };

  const handleDeleteLanguage = (name: string) => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    // Remove language logic would go here
    setLanguages(languages.filter(lang => lang.name !== name));
    toast.success("Langue supprimée avec succès");
  };

  // Functions for managing certifications
  const handleAddCertification = () => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    setCurrentCertification(null);
    setShowCertificationModal(true);
  };

  const handleEditCertification = (certification: Certification) => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    setCurrentCertification(certification);
    setShowCertificationModal(true);
  };

  const handleDeleteCertification = (id: string | undefined) => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    if (!id) return;
    // Remove certification logic would go here
    setCertifications(certifications.filter(cert => cert.id !== id));
    toast.success("Certification supprimée avec succès");
  };

  // Function to handle CV Analysis
  const handleCVAnalysis = () => {
    if (!profileData?.isPremium) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs premium.");
      return;
    }
    setShowCVAnalyzerModal(true);
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

  // Check if the user is viewing their own profile
  const isOwner = user?.id === profileData?.id;

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
                    {profileData.isPremium && (
                      <div className="mt-2">
                        <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                          Profil Premium
                        </span>
                      </div>
                    )}
                    <div className="mt-4 w-full">
                      <Button 
                        className="w-full" 
                        onClick={() => setIsEditing(true)}
                      >
                        Modifier le profil
                      </Button>
                    </div>
                    {isOwner && (
                      <div className="mt-2 w-full">
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={handleCVAnalysis}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Analyser mon CV
                        </Button>
                      </div>
                    )}
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
                    isPremium={profileData.isPremium}
                  />
                </TabsContent>
                
                <TabsContent value="cv">
                  <CVTab 
                    userId={user.id} 
                    isPremium={profileData.isPremium}
                  />
                </TabsContent>
                
                <TabsContent value="portfolio">
                  <Portfolio 
                    userId={user.id} 
                    projects={[]} 
                    isOwner={isOwner}
                    isPremium={profileData.isPremium}
                  />
                </TabsContent>
                
                <TabsContent value="recommendations">
                  <CompanyRecommendations 
                    userId={user.id}
                    onMessageClick={handleMessageButtonClick}
                    isPremium={profileData.isPremium}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Edit Profile Modal */}
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

          {/* Experience Modal */}
          <Dialog open={showExperienceModal} onOpenChange={setShowExperienceModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentExperience ? "Modifier l'expérience" : "Ajouter une expérience"}
                </DialogTitle>
                <DialogDescription>
                  {currentExperience 
                    ? "Modifiez les détails de votre expérience professionnelle." 
                    : "Ajoutez une nouvelle expérience professionnelle à votre profil."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Poste</Label>
                  <Input 
                    id="role" 
                    placeholder="Développeur Frontend" 
                    defaultValue={currentExperience?.role} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input 
                    id="company" 
                    placeholder="Nom de l'entreprise" 
                    defaultValue={currentExperience?.company} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input 
                    id="location" 
                    placeholder="Paris, France" 
                    defaultValue={currentExperience?.location} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Période</Label>
                  <Input 
                    id="period" 
                    placeholder="Janvier 2022 - Présent" 
                    defaultValue={currentExperience?.period} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Décrivez vos responsabilités et réalisations..." 
                    defaultValue={currentExperience?.description} 
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowExperienceModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" onClick={() => setShowExperienceModal(false)}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Education Modal */}
          <Dialog open={showEducationModal} onOpenChange={setShowEducationModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentEducation ? "Modifier la formation" : "Ajouter une formation"}
                </DialogTitle>
                <DialogDescription>
                  {currentEducation 
                    ? "Modifiez les détails de votre formation." 
                    : "Ajoutez une nouvelle formation à votre profil."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="degree">Diplôme</Label>
                  <Input 
                    id="degree" 
                    placeholder="Master en Informatique" 
                    defaultValue={currentEducation?.degree} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input 
                    id="institution" 
                    placeholder="Université Paris-Saclay" 
                    defaultValue={currentEducation?.institution} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input 
                    id="location" 
                    placeholder="Paris, France" 
                    defaultValue={currentEducation?.location} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Période</Label>
                  <Input 
                    id="period" 
                    placeholder="2020 - 2022" 
                    defaultValue={currentEducation?.period} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Décrivez votre formation..." 
                    defaultValue={currentEducation?.description} 
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEducationModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" onClick={() => setShowEducationModal(false)}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Skill Modal */}
          <Dialog open={showSkillModal} onOpenChange={setShowSkillModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentSkill ? "Modifier la compétence" : "Ajouter une compétence"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="skill-name">Nom de la compétence</Label>
                  <Input 
                    id="skill-name" 
                    placeholder="React.js" 
                    defaultValue={currentSkill?.name} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill-level">Niveau (1-10)</Label>
                  <Input 
                    id="skill-level" 
                    type="number" 
                    min="1" 
                    max="10" 
                    placeholder="8" 
                    defaultValue={currentSkill?.level.toString()} 
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSkillModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" onClick={() => setShowSkillModal(false)}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Language Modal */}
          <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentLanguage ? "Modifier la langue" : "Ajouter une langue"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="language-name">Langue</Label>
                  <Input 
                    id="language-name" 
                    placeholder="Français" 
                    defaultValue={currentLanguage?.name} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language-level">Niveau</Label>
                  <Input 
                    id="language-level" 
                    placeholder="Natif" 
                    defaultValue={currentLanguage?.level} 
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowLanguageModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" onClick={() => setShowLanguageModal(false)}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Certification Modal */}
          <Dialog open={showCertificationModal} onOpenChange={setShowCertificationModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentCertification ? "Modifier la certification" : "Ajouter une certification"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cert-name">Nom de la certification</Label>
                  <Input 
                    id="cert-name" 
                    placeholder="AWS Certified Developer" 
                    defaultValue={currentCertification?.name} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-issuer">Émetteur</Label>
                  <Input 
                    id="cert-issuer" 
                    placeholder="Amazon Web Services" 
                    defaultValue={currentCertification?.issuer} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-date">Date</Label>
                  <Input 
                    id="cert-date" 
                    placeholder="2023" 
                    defaultValue={currentCertification?.date} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-description">Description</Label>
                  <Textarea 
                    id="cert-description" 
                    placeholder="Description de la certification..." 
                    defaultValue={currentCertification?.description} 
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCertificationModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" onClick={() => setShowCertificationModal(false)}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* CV Analyzer Modal */}
          <Dialog open={showCVAnalyzerModal} onOpenChange={setShowCVAnalyzerModal}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Analyser mon CV</DialogTitle>
                <DialogDescription>
                  Téléchargez votre CV pour une analyse automatique et importez les informations dans votre profil.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Glissez et déposez votre CV ici</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    ou
                  </p>
                  <Button>Parcourir les fichiers</Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Formats acceptés : PDF, DOCX, DOC (max. 5MB)
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCVAnalyzerModal(false)}>
                    Annuler
                  </Button>
                  <Button disabled>
                    Analyser et importer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
