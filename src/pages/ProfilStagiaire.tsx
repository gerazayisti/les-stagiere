import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AboutTab } from '@/components/profile/AboutTab';
import { CVTab } from '@/components/profile/CVTab';
import { Recommendations } from '@/components/profile/Recommendations';
import Portfolio from '@/components/profile/Portfolio';
import { ProfilCandidatures } from '@/components/candidatures/ProfilCandidatures';
import { useStagiaire } from '@/hooks/useStagiaire';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, FileSearch, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { EditStagiaireDialog, StagiaireFormValues } from '@/components/profile/EditStagiaireDialog';
import { Button } from '@/components/ui/button';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

// Fonction de mise en cache pour les profils stagiaires
const cacheStagiaireProfile = (id: string, data: any) => {
  try {
    localStorage.setItem(`cachedStagiaireProfile_${id}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Erreur de mise en cache:', error);
  }
};

// Fonction de récupération du cache
const getCachedStagiaireProfile = (id: string) => {
  try {
    const cachedData = localStorage.getItem(`cachedStagiaireProfile_${id}`);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // Cache valide pendant 15 minutes
      return (Date.now() - timestamp < 15 * 60 * 1000) ? data : null;
    }
  } catch (error) {
    console.warn('Erreur de lecture du cache:', error);
  }
  return null;
};

export default function ProfilStagiaire() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("about");
  
  // Récupération du cache avant d'appeler le hook
  const cachedStagiaire = getCachedStagiaireProfile(id || '');
  
  // Utiliser le hook useStagiaire avec le cache comme initialState
  const { stagiaire, loading, error, updateStagiaire } = useStagiaire(id || '', cachedStagiaire ? { ...cachedStagiaire } : null);
  
  const { user } = useAuth();
  const [headerLoaded, setHeaderLoaded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const { resetTimeout } = useSessionTimeout();

  // Mise en cache des données
  useEffect(() => {
    if (stagiaire) {
      cacheStagiaireProfile(id || '', stagiaire);
    }
  }, [stagiaire, id]);

  // Reset session timeout on component mount
  useEffect(() => {
    resetTimeout();
  }, [resetTimeout]);

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

        {isMobile ? (
          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="about">
              <AccordionTrigger>À propos</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-16 w-3/4" />
                  <Skeleton className="h-16 w-1/2" />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <Tabs defaultValue="about" className="mt-8">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="about">À propos</TabsTrigger>
              <TabsTrigger value="cv">CV & Documents</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
              <TabsTrigger value="candidatures">Candidatures</TabsTrigger>
            </TabsList>
            <TabsContent value="about">
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-16 w-1/2" />
              </div>
            </TabsContent>
          </Tabs>
        )}
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
  const socials = stagiaire?.social_links || {};
  const initialFormData: StagiaireFormValues = {
    name: stagiaire?.name || "",
    title: stagiaire?.title || "",
    bio: stagiaire?.bio || "",
    education: Array.isArray(stagiaire?.education) ? stagiaire?.education : [],
    phone: stagiaire?.phone || "",
    website: socials.website || "",
    github: socials.github || "",
    linkedin: socials.linkedin || ""
  };

  // Ensure proper types for disponibility
  const disponibility = stagiaire.disponibility &&
    (stagiaire.disponibility === "upcoming" || stagiaire.disponibility === "immediate")
    ? stagiaire.disponibility
    : "upcoming";

  // Formater les données pour les composants
  let educationData = [];
  if (stagiaire?.education) {
    // Check if education is a string or an array
    if (typeof stagiaire.education === 'string') {
      try {
        // Try to parse it if it's a JSON string
        educationData = JSON.parse(stagiaire.education);
      } catch (e) {
        // If parsing fails, use it as a simple string
        educationData = [{ 
          school: stagiaire.education,
          degree: '',
          field: '',
          start_date: '',
          end_date: '',
          description: ''
        }];
      }
    } else {
      // It's already an array
      educationData = stagiaire.education;
    }
  }

  const handleProfileUpdate = () => {
    updateStagiaire({}); // Refresh stagiaire data after update with empty object to trigger refetch
    toast.success("Profil mis à jour avec succès");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <ProfileHeader
        name={stagiaire.name}
        avatarUrl={stagiaire.avatar_url}
        bio={stagiaire.bio || ""}
        location={stagiaire.location || ""}
        socials={socials}
        editable={isCurrentUser}
        userId={stagiaire.id}
        onEdit={() => setIsEditProfileModalOpen(true)}
      />

      {isMobile ? (
        <Accordion type="single" collapsible className="mt-8">
          <AccordionItem value="about">
            <AccordionTrigger>À propos</AccordionTrigger>
            <AccordionContent>
              {isCurrentUser && (
                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={() => setIsEditProfileModalOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier le profil
                  </Button>
                </div>
              )}
              <AboutTab
                bio={stagiaire.bio || ""}
                disponibility={disponibility}
                education={educationData}
                isPremium={stagiaire.is_premium}
                userId={stagiaire.id}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cv">
            <AccordionTrigger>CV & Documents</AccordionTrigger>
            <AccordionContent>
              <CVTab
                userId={stagiaire.id}
                isPremium={stagiaire.is_premium}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="portfolio">
            <AccordionTrigger>Portfolio</AccordionTrigger>
            <AccordionContent>
              <Portfolio />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recommendations">
            <AccordionTrigger>Recommandations</AccordionTrigger>
            <AccordionContent>
              <Recommendations
                recommendations={stagiaire.recommendations || []}
                isOwner={isCurrentUser}
                stagiaireId={stagiaire.id}
                isPremium={stagiaire.is_premium}
              />
            </AccordionContent>
          </AccordionItem>

          {isCurrentUser && (
            <AccordionItem value="candidatures">
              <AccordionTrigger>
                <div className="flex items-center">
                  <FileSearch className="mr-2 h-4 w-4" /> Candidatures
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ProfilCandidatures />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      ) : (
        <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="about">À propos</TabsTrigger>
            <TabsTrigger value="cv">CV & Documents</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
            {isCurrentUser && (
              <TabsTrigger value="candidatures">
                <FileSearch className="mr-2 h-4 w-4" /> Candidatures
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="about">
            {isCurrentUser && (
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={() => setIsEditProfileModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier le profil
                </Button>
              </div>
            )}
            <AboutTab
              bio={stagiaire.bio || ""}
              disponibility={disponibility}
              education={educationData}
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
          {isCurrentUser && (
            <TabsContent value="candidatures">
              <ProfilCandidatures />
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Edit Profile Modal */}
      {isCurrentUser && isEditProfileModalOpen && (
        <EditStagiaireDialog
          stagiaireId={stagiaire.id}
          initialData={initialFormData}
          onSuccess={handleProfileUpdate}
        />
      )}
    </div>
  );
}
