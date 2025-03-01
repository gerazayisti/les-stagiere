
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Building2,
  Users,
  Globe,
  Mail,
  Phone,
  Briefcase,
  Edit,
  ImagePlus,
  CalendarClock,
  Clock,
  Star,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GestionStages } from "@/components/GestionStages";
import { GestionCandidatures } from "@/components/GestionCandidatures";
import { EditEntrepriseForm } from "@/components/EditEntrepriseForm";
import { useToast } from "@/hooks/use-toast";
import { CompanyRecommendations } from "@/components/profile/CompanyRecommendations";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

// Interfaces using string IDs
interface Stage {
  id: string;
  titre: string;
  description: string;
  competences: string[];
  lieu: string;
  duree: string;
  remuneration: string;
  date_debut: string;
  date_publication: string;
}

interface Candidat {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  cv: string;
  lettre: string;
  datePostulation: Date;
  competences: string[];
  experience: string;
  formation: string;
  photo: string;
  disponibilite: string;
  location?: string;
  hasRecommendation?: boolean;
}

interface Candidature {
  id: string;
  candidat: Candidat;
  stageId: string;
  stageTitre: string;
  status: "en_attente" | "acceptee" | "refusee" | "en_discussion";
  datePostulation: Date;
  noteInterne?: string;
}

interface CompanyData {
  id: string;
  name: string;
  logo_url?: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  email: string;
  phone?: string;
}

export default function ProfilEntreprise() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("about");
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const { toast } = useToast();

  const isOwner = user?.id === id;

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching company data for ID:", id);
        
        const { data, error } = await supabase
          .from("entreprises")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching company data:", error);
          throw error;
        }

        if (isMounted) {
          console.log("Company data received:", data);
          setCompany(data as CompanyData);
          
          // Only fetch these if the user is the owner
          if (isOwner) {
            await fetchStages();
            await fetchCandidatures();
          }
        }
      } catch (error: any) {
        if (isMounted) {
          console.error("Erreur lors du chargement des données:", error);
          setError(error.message || "Impossible de charger les données de l'entreprise");
          toast({
            title: "Erreur",
            description: "Impossible de charger les données de l'entreprise",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [id, isOwner, toast]);

  const fetchStages = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .eq("entreprise_id", id);

      if (error) throw error;

      // Sort by creation date if available, otherwise use an empty array
      const sortedData = data 
        ? [...data].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        : [];
        
      setStages(sortedData as Stage[]);
    } catch (error) {
      console.error("Erreur lors du chargement des stages:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les stages",
        variant: "destructive",
      });
    }
  };

  const fetchCandidatures = async () => {
    try {
      // Simuler des données pour l'exemple
      const mockCandidatures: Candidature[] = [
        {
          id: "1",
          candidat: {
            id: "101",
            nom: "Jean Dupont",
            email: "jean.dupont@example.com",
            telephone: "0612345678",
            cv: "/path/to/cv.pdf",
            lettre: "Lettre de motivation...",
            datePostulation: new Date("2023-05-10"),
            competences: ["React", "TypeScript", "Node.js"],
            experience: "2 ans",
            formation: "Master en Informatique",
            photo: "https://randomuser.me/api/portraits/men/1.jpg",
            disponibilite: "Immédiate",
            location: "Paris, France",
          },
          stageId: "201",
          stageTitre: "Développeur Frontend React",
          status: "en_attente",
          datePostulation: new Date("2023-05-10"),
        },
        {
          id: "2",
          candidat: {
            id: "102",
            nom: "Marie Martin",
            email: "marie.martin@example.com",
            telephone: "0623456789",
            cv: "/path/to/cv2.pdf",
            lettre: "Lettre de motivation...",
            datePostulation: new Date("2023-05-09"),
            competences: ["UI/UX", "Figma", "Adobe XD"],
            experience: "1 an",
            formation: "Bachelor en Design",
            photo: "https://randomuser.me/api/portraits/women/2.jpg",
            disponibilite: "Dans 2 mois",
            location: "Lyon, France",
            hasRecommendation: true,
          },
          stageId: "202",
          stageTitre: "Designer UI/UX",
          status: "acceptee",
          datePostulation: new Date("2023-05-09"),
        },
        {
          id: "3",
          candidat: {
            id: "103",
            nom: "Pierre Durand",
            email: "pierre.durand@example.com",
            telephone: "0634567890",
            cv: "/path/to/cv3.pdf",
            lettre: "Lettre de motivation...",
            datePostulation: new Date("2023-05-08"),
            competences: ["Python", "Data Analysis", "Machine Learning"],
            experience: "3 ans",
            formation: "Doctorat en Data Science",
            photo: "https://randomuser.me/api/portraits/men/3.jpg",
            disponibilite: "Immédiate",
            location: "Toulouse, France",
          },
          stageId: "203",
          stageTitre: "Data Scientist",
          status: "en_discussion",
          datePostulation: new Date("2023-05-08"),
        },
      ];

      setCandidatures(mockCandidatures);
    } catch (error) {
      console.error("Erreur lors du chargement des candidatures:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les candidatures",
        variant: "destructive",
      });
    }
  };

  const updateCandidatureStatus = (candidatureId: string, newStatus: Candidature["status"]) => {
    setCandidatures((prev) =>
      prev.map((candidature) =>
        candidature.id === candidatureId
          ? { ...candidature, status: newStatus }
          : candidature
      )
    );

    toast({
      title: "Statut mis à jour",
      description: "Le statut de la candidature a été mis à jour avec succès",
    });
    
    // If status is "en_discussion", open a message thread with the candidate
    const candidature = candidatures.find(c => c.id === candidatureId);
    if (newStatus === "en_discussion" && candidature) {
      // Navigate to messagerie with this candidate
      toast({
        title: "Discussion ouverte",
        description: `Une conversation a été ouverte avec ${candidature.candidat.nom}`,
      });
      navigate('/messagerie');
    }
  };

  const addRecommendation = (candidatId: string) => {
    // Logique pour ajouter une recommandation
    toast({
      title: "Recommandation ajoutée",
      description: "Vous avez recommandé ce candidat avec succès",
    });
  };

  const handleUpdateCompany = async (data: Partial<CompanyData>) => {
    if (!id) return;
    
    try {
      setLoading(true);

      const { error } = await supabase
        .from("entreprises")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      setCompany((prev) => (prev ? { ...prev, ...data } : null));
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
      setIsEditMode(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        title: "Erreur",
        description:
          "Impossible de mettre à jour le profil. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle case where no company data is found
  if (!company && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profil non trouvé</CardTitle>
            <CardDescription>
              Le profil d'entreprise que vous recherchez n'existe pas ou vous n'avez pas les permissions nécessaires pour y accéder.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {company && (
        <>
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-shrink-0">
              <Avatar className="w-24 h-24 md:w-32 md:h-32">
                <AvatarImage src={company.logo_url} />
                <AvatarFallback className="text-2xl">
                  {company.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{company.name}</h1>
                  <p className="text-xl text-muted-foreground">
                    {company.industry}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{company.size}</span>
                    </div>
                    {company.website && (
                      <div className="flex items-center gap-1 text-primary">
                        <Globe className="w-4 h-4" />
                        <a
                          href={
                            company.website.startsWith("http")
                              ? company.website
                              : `https://${company.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Site web
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                {isOwner && (
                  <Button
                    onClick={() => setIsEditMode(true)}
                    className="md:flex items-center gap-2 hidden"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </Button>
                )}
              </div>
              {isOwner && (
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="mt-4 w-full md:hidden flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Button>
              )}
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
              <TabsTrigger value="about">À propos</TabsTrigger>
              {isOwner && (
                <>
                  <TabsTrigger value="stages">Offres de stages</TabsTrigger>
                  <TabsTrigger value="candidatures">Candidatures</TabsTrigger>
                  <TabsTrigger value="recommandations">
                    Recommandations
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>À propos de {company.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p>{company.description}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isOwner && (
              <TabsContent value="stages">
                <GestionStages enterpriseId={id || ""} />
              </TabsContent>
            )}

            {isOwner && (
              <TabsContent value="candidatures">
                <GestionCandidatures
                  candidatures={candidatures}
                  onUpdateStatus={updateCandidatureStatus}
                  onAddRecommendation={addRecommendation}
                />
              </TabsContent>
            )}

            {isOwner && (
              <TabsContent value="recommandations">
                <CompanyRecommendations
                  companyId={id || ""}
                  companyName={company.name}
                  companyLogo={company.logo_url || ""}
                  interns={[
                    {
                      id: "101",
                      name: "Jean Dupont",
                      hasRecommendation: false,
                    },
                    {
                      id: "102",
                      name: "Marie Martin",
                      hasRecommendation: true,
                    },
                    {
                      id: "103",
                      name: "Pierre Durand",
                      hasRecommendation: false,
                    },
                  ]}
                />
              </TabsContent>
            )}

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Coordonnées</CardTitle>
                  <CardDescription>
                    Comment contacter {company.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <a
                      href={`mailto:${company.email}`}
                      className="text-primary hover:underline"
                    >
                      {company.email}
                    </a>
                  </div>
                  {company.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <a
                        href={`tel:${company.phone}`}
                        className="text-primary hover:underline"
                      >
                        {company.phone}
                      </a>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <a
                        href={
                          company.website.startsWith("http")
                            ? company.website
                            : `https://${company.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{company.location}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {isEditMode && company && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-y-auto p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <EditEntrepriseForm
              entreprise={company}
              onSubmit={handleUpdateCompany}
              onCancel={() => setIsEditMode(false)}
              isLoading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
