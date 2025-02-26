import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompanyRecommendations } from "@/components/profile/CompanyRecommendations";
import { EditEntrepriseForm } from "@/components/EditEntrepriseForm";
import { GestionStages } from "@/components/GestionStages";
import { GestionCandidatures } from "@/components/GestionCandidatures";
import { RecommendationForm, RecommendationData } from "@/components/profile/RecommendationForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Users, Star, MapPin, Globe, Phone, Mail } from "lucide-react";

interface CompanyData {
  id: string;
  name: string;
  logo: string;
  description: string;
  industry: string;
  location: string;
  website: string;
  phone: string;
  email: string;
  employeeCount: string;
  foundedYear: number;
}

interface Stage {
  id: number;
  titre: string;
  description: string;
  duree: string;
  dateDebut: Date;
  competencesRequises: string[];
  remuneration: string;
}

interface Candidat {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  cv: string;
  lettre: string;
  competences: string[];
  experience: string;
  formation: string;
  photo: string;
  disponibilite: string;
  hasRecommendation?: boolean;
}

interface Candidature {
  id: number;
  candidat: Candidat;
  stageId: number;
  stageTitre: string;
  status: "en_attente" | "acceptee" | "refusee" | "en_discussion";
  datePostulation: Date;
  noteInterne?: string;
}

export default function ProfilEntreprise() {
  const [activeTab, setActiveTab] = useState("about");
  const [entreprise, setEntreprise] = useState<CompanyData>({
    id: "1",
    name: "TechCorp Solutions",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC",
    description: "Leader dans le développement de solutions technologiques innovantes",
    industry: "Technologies de l'information",
    location: "Yaoundé, Cameroun",
    website: "www.techcorp.com",
    phone: "+237 6XX XX XX XX",
    email: "contact@techcorp.com",
    employeeCount: "50-100",
    foundedYear: 2015,
  });

  const [stages, setStages] = useState<Stage[]>([
    {
      id: 1,
      titre: "Développeur Full-Stack",
      description: "Stage de développement web avec React et Node.js",
      duree: "6 mois",
      dateDebut: new Date(2024, 2, 1),
      competencesRequises: ["React", "Node.js", "TypeScript"],
      remuneration: "1000€/mois",
    },
    {
      id: 2,
      titre: "UX Designer",
      description: "Conception d'interfaces utilisateur pour nos produits",
      duree: "4 mois",
      dateDebut: new Date(2024, 3, 1),
      competencesRequises: ["Figma", "Adobe XD", "Prototypage"],
      remuneration: "800€/mois",
    },
  ]);

  const [candidatures, setCandidatures] = useState<Candidature[]>([
    {
      id: 1,
      candidat: {
        id: 1,
        nom: "Sophie Martin",
        email: "sophie.martin@email.com",
        telephone: "06 12 34 56 78",
        cv: "/cvs/sophie-martin.pdf",
        lettre: "/lettres/sophie-martin.pdf",
        competences: ["React", "TypeScript", "Node.js"],
        experience: "Stage de 6 mois en développement web",
        formation: "Master 2 Informatique",
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
        disponibilite: "Disponible dès mars 2024",
        hasRecommendation: false,
      },
      stageId: 1,
      stageTitre: "Développeur Full-Stack",
      status: "en_discussion",
      datePostulation: new Date(2024, 1, 15),
      noteInterne: "Candidate prometteuse, à recontacter",
    },
    {
      id: 2,
      candidat: {
        id: 2,
        nom: "Lucas Dubois",
        email: "lucas.dubois@email.com",
        telephone: "06 98 76 54 32",
        cv: "/cvs/lucas-dubois.pdf",
        lettre: "/lettres/lucas-dubois.pdf",
        competences: ["Figma", "Adobe XD", "UI/UX"],
        experience: "Projets freelance en design",
        formation: "Bachelor Design Numérique",
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
        disponibilite: "Disponible dès avril 2024",
        hasRecommendation: true,
      },
      stageId: 2,
      stageTitre: "UX Designer",
      status: "acceptee",
      datePostulation: new Date(2024, 1, 20),
    },
  ]);

  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [selectedCandidat, setSelectedCandidat] = useState<{ id: string; name: string } | null>(null);

  const handleEntrepriseUpdate = (newData: Partial<CompanyData>) => {
    setEntreprise((prev) => ({ ...prev, ...newData }));
  };

  const handleStagesUpdate = (newStages: Stage[]) => {
    setStages(newStages);
  };

  const handleCandidatureStatusUpdate = (
    candidatureId: number,
    newStatus: Candidature["status"]
  ) => {
    setCandidatures((prev) =>
      prev.map((candidature) =>
        candidature.id === candidatureId
          ? { ...candidature, status: newStatus }
          : candidature
      )
    );
  };

  const handleAddRecommendation = (candidatId: number) => {
    const candidat = candidatures.find(c => c.candidat.id === candidatId);
    if (candidat) {
      setSelectedCandidat({
        id: candidat.candidat.id.toString(),
        name: candidat.candidat.nom
      });
      setShowRecommendationForm(true);
    }
  };

  const handleRecommendationSubmit = (data: RecommendationData) => {
    // Ici, vous ajouterez la logique pour sauvegarder la recommandation
    console.log("Nouvelle recommandation:", data);
    
    // Mettre à jour le statut de recommandation du candidat
    setCandidatures(prev =>
      prev.map(c =>
        c.candidat.id === parseInt(data.candidatId)
          ? {
              ...c,
              candidat: {
                ...c.candidat,
                hasRecommendation: true
              }
            }
          : c
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête du profil */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={entreprise.logo} />
            <AvatarFallback>{entreprise.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">{entreprise.name}</h1>
            <p className="text-muted-foreground">{entreprise.description}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>{entreprise.industry}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{entreprise.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{entreprise.employeeCount} employés</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Onglets */}
      <Tabs defaultValue={activeTab} className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="edit">Modifier</TabsTrigger>
          <TabsTrigger value="stages">Stages</TabsTrigger>
          <TabsTrigger value="candidatures">Candidatures</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Site web</p>
                        <a
                          href={`https://${entreprise.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {entreprise.website}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Téléphone</p>
                        <p className="text-muted-foreground">{entreprise.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a
                          href={`mailto:${entreprise.email}`}
                          className="text-primary hover:underline"
                        >
                          {entreprise.email}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Année de création</p>
                      <p className="text-muted-foreground">{entreprise.foundedYear}</p>
                    </div>
                    <div>
                      <p className="font-medium">Taille de l'entreprise</p>
                      <p className="text-muted-foreground">
                        {entreprise.employeeCount} employés
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card className="p-6">
            <EditEntrepriseForm
              initialData={entreprise}
              onSubmit={handleEntrepriseUpdate}
            />
          </Card>
        </TabsContent>

        <TabsContent value="stages">
          <Card className="p-6">
            <GestionStages
              stages={stages}
              onUpdate={handleStagesUpdate}
            />
          </Card>
        </TabsContent>

        <TabsContent value="candidatures">
          <Card className="p-6">
            <GestionCandidatures
              candidatures={candidatures}
              onUpdateStatus={handleCandidatureStatusUpdate}
              onAddRecommendation={handleAddRecommendation}
            />
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <CompanyRecommendations
            companyId={entreprise.id}
            companyName={entreprise.name}
            companyLogo={entreprise.logo}
            // On ne passe que les candidats acceptés
            stagiaires={candidatures
              .filter((c) => c.status === "acceptee")
              .map((c) => ({
                id: c.candidat.id.toString(),
                name: c.candidat.nom,
                hasRecommendation: c.candidat.hasRecommendation,
              }))}
          />
        </TabsContent>
      </Tabs>
      {selectedCandidat && (
        <RecommendationForm
          isOpen={showRecommendationForm}
          onClose={() => {
            setShowRecommendationForm(false);
            setSelectedCandidat(null);
          }}
          onSubmit={handleRecommendationSubmit}
          candidat={selectedCandidat}
        />
      )}
    </div>
  );
}
