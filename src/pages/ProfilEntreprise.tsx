import { useParams } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { Loader2, MapPin, Globe, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CompanyRecommendations } from "@/components/profile/CompanyRecommendations";
import { EditEntrepriseForm } from "@/components/EditEntrepriseForm";
import { GestionStages } from "@/components/GestionStages";
import { GestionCandidatures } from "@/components/GestionCandidatures";
import { RecommendationForm, RecommendationData } from "@/components/profile/RecommendationForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Users as UsersIcon, Star, MapPin as MapPinIcon, Globe as GlobeIcon, Phone, Mail } from "lucide-react";

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
  const { id } = useParams();
  const { profile, loading, error, isOwner } = useProfile({
    id: id!,
    type: 'entreprise'
  });

  const [activeTab, setActiveTab] = useState("about");
  const [entreprise, setEntreprise] = useState<CompanyData>({
    id: profile.id,
    name: profile.name,
    logo: profile.logo_url,
    description: profile.description,
    industry: profile.industry,
    location: profile.location,
    website: profile.website,
    phone: profile.phone,
    email: profile.email,
    employeeCount: profile.size,
    foundedYear: profile.founded_year,
  });

  const [stages, setStages] = useState<Stage[]>([
    // Add stages data here
  ]);

  const [candidatures, setCandidatures] = useState<Candidature[]>([
    // Add candidatures data here
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête du profil */}
      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        {profile.banner_url && (
          <div className="h-48 w-full relative">
            <img
              src={profile.banner_url}
              alt={`Bannière de ${profile.name}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center space-x-4">
            {profile.logo_url ? (
              <img
                src={profile.logo_url}
                alt={profile.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-semibold">
                  {profile.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.industry && (
                  <div className="flex items-center">
                    <GlobeIcon className="h-4 w-4 mr-1" />
                    <span>{profile.industry}</span>
                  </div>
                )}
                {profile.size && (
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    <span>{profile.size} employés</span>
                  </div>
                )}
                {profile.founded_year && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Fondée en {profile.founded_year}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="mt-4">
              <Button variant="outline" className="mr-2">
                Modifier le profil
              </Button>
              <Button>
                Publier une offre
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">À propos</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {profile.description || 'Aucune description disponible'}
            </p>
          </div>

          {profile.company_culture && (
            <div className="bg-card rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Culture d'entreprise</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {profile.company_culture}
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Avantages</h2>
            <div className="space-y-2">
              {profile.benefits?.map((benefit: string) => (
                <div
                  key={benefit}
                  className="flex items-center p-2 bg-muted rounded-lg"
                >
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {profile.social_media && (
            <div className="bg-card rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Réseaux sociaux</h2>
              <div className="space-y-2">
                {Object.entries(profile.social_media).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <span className="capitalize">{platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
                      <GlobeIcon className="w-5 h-5 text-muted-foreground" />
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
