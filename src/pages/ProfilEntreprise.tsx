import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Building2, MapPin, Users, Globe, Mail, Phone } from "lucide-react";
import { EditEntrepriseForm } from "@/components/EditEntrepriseForm";
import { GestionStages } from "@/components/GestionStages";
import { GestionCandidatures } from "@/components/GestionCandidatures";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfilEntreprise = () => {
  const [entreprise, setEntreprise] = useState({
    nom: "TechCorp",
    logo: "https://via.placeholder.com/150",
    description: "TechCorp est une entreprise innovante spécialisée dans le développement de solutions web...",
    secteur: "Technologies de l'information",
    taille: "50-200 employés",
    localisation: "Paris, France",
    site: "https://techcorp.fr",
    email: "contact@techcorp.fr",
    telephone: "01 23 45 67 89",
  });

  const [stages, setStages] = useState([
    {
      id: 1,
      titre: "Développeur Full-Stack",
      description: "Stage de développement web avec React et Node.js",
      duree: "6 mois",
      dateDebut: new Date(2024, 2, 1), // Mars 2024
      competencesRequises: ["React", "Node.js", "TypeScript"],
      remuneration: "1000€/mois",
    },
    {
      id: 2,
      titre: "UX Designer",
      description: "Conception d'interfaces utilisateur pour nos produits",
      duree: "4 mois",
      dateDebut: new Date(2024, 3, 1), // Avril 2024
      competencesRequises: ["Figma", "Adobe XD", "Prototypage"],
      remuneration: "800€/mois",
    },
  ]);

  const [candidatures, setCandidatures] = useState([
    {
      id: 1,
      candidat: {
        id: 1,
        nom: "Sophie Martin",
        email: "sophie.martin@email.com",
        telephone: "06 12 34 56 78",
        cv: "/cvs/sophie-martin.pdf",
        lettre: "/lettres/sophie-martin.pdf",
        datePostulation: new Date(2024, 1, 15),
        competences: ["React", "TypeScript", "Node.js"],
        experience: "Stage de 6 mois en développement web",
        formation: "Master 2 Informatique",
        photo: "https://via.placeholder.com/150",
        linkedin: "https://linkedin.com/in/sophie-martin",
        github: "https://github.com/sophie-martin",
        portfolio: "https://sophie-martin.dev",
        localisation: "Paris, France",
        disponibilite: "Disponible dès mars 2024",
        projets: [
          {
            titre: "E-commerce React",
            description: "Application e-commerce avec React et Node.js",
            technologies: ["React", "Node.js", "MongoDB"],
            lien: "https://github.com/sophie-martin/ecommerce",
          },
        ],
        experiences: [
          {
            poste: "Développeur Frontend Stagiaire",
            entreprise: "WebStart",
            periode: "Juin 2023 - Décembre 2023",
            description: "Développement d'interfaces utilisateur avec React",
          },
        ],
        formations: [
          {
            diplome: "Master Informatique",
            ecole: "Université Paris Saclay",
            periode: "2022 - 2024",
            description: "Spécialisation en développement web",
          },
        ],
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
        datePostulation: new Date(2024, 1, 20),
        competences: ["Figma", "Adobe XD", "UI/UX"],
        experience: "Projets freelance en design",
        formation: "Bachelor Design Numérique",
        photo: "https://via.placeholder.com/150",
        linkedin: "https://linkedin.com/in/lucas-dubois",
        portfolio: "https://lucas-dubois.design",
        localisation: "Lyon, France",
        disponibilite: "Disponible dès avril 2024",
        projets: [
          {
            titre: "Refonte UX Application Mobile",
            description: "Refonte complète de l'expérience utilisateur d'une application de livraison",
            technologies: ["Figma", "Prototypage", "Design System"],
            lien: "https://behance.net/lucas-dubois/delivery-app",
          },
        ],
        experiences: [
          {
            poste: "UI/UX Designer Freelance",
            entreprise: "Indépendant",
            periode: "Janvier 2023 - Présent",
            description: "Création d'interfaces utilisateur pour diverses startups",
          },
        ],
        formations: [
          {
            diplome: "Bachelor Design Numérique",
            ecole: "École de Design de Lyon",
            periode: "2021 - 2024",
            description: "Formation en design d'interface et expérience utilisateur",
          },
        ],
      },
      stageId: 2,
      stageTitre: "UX Designer",
      status: "en_attente",
      datePostulation: new Date(2024, 1, 20),
    },
  ]);

  const handleEntrepriseUpdate = (newData: typeof entreprise) => {
    setEntreprise(newData);
  };

  const handleStagesUpdate = (newStages: typeof stages) => {
    setStages(newStages);
  };

  const handleCandidatureStatusUpdate = (
    candidatureId: number,
    newStatus: "en_attente" | "acceptee" | "refusee" | "en_discussion"
  ) => {
    setCandidatures((prev) =>
      prev.map((candidature) =>
        candidature.id === candidatureId
          ? { ...candidature, status: newStatus }
          : candidature
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="edit">Modifier le profil</TabsTrigger>
            <TabsTrigger value="stages">Gestion des stages</TabsTrigger>
            <TabsTrigger value="candidatures">Candidatures</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-8">
                {/* Company Header */}
                <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in">
                  <div className="flex items-center gap-6">
                    <img
                      src={entreprise.logo}
                      alt={entreprise.nom}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div>
                      <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        {entreprise.nom}
                      </h1>
                      <div className="flex flex-wrap gap-4 text-gray">
                        <span className="flex items-center gap-1">
                          <Building2 size={16} />
                          {entreprise.secteur}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={16} />
                          {entreprise.localisation}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={16} />
                          {entreprise.taille}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Description */}
                <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in">
                  <h2 className="text-xl font-semibold mb-4">À propos de l'entreprise</h2>
                  <p className="text-gray">{entreprise.description}</p>
                </div>

                {/* Active Internships */}
                <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in">
                  <h2 className="text-xl font-semibold mb-4">Stages actifs</h2>
                  <div className="space-y-4">
                    {stages.map((stage) => (
                      <div
                        key={stage.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                      >
                        <h3 className="font-semibold">{stage.titre}</h3>
                        <p className="text-gray-600 mt-1">{stage.description}</p>
                        <div className="flex gap-4 mt-2 text-gray text-sm">
                          <span>{stage.duree}</span>
                          <span>Début : {stage.dateDebut.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
                        </div>
                        {stage.remuneration && (
                          <p className="text-sm text-gray-600 mt-1">
                            Rémunération : {stage.remuneration}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div>
                <div className="bg-white p-6 rounded-lg shadow-sm animate-fade-in">
                  <h2 className="text-xl font-semibold mb-4">Contact</h2>
                  <div className="space-y-3">
                    <a
                      href={entreprise.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray hover:text-primary transition-colors"
                    >
                      <Globe size={16} />
                      Site web
                    </a>
                    <a
                      href={`mailto:${entreprise.email}`}
                      className="flex items-center gap-2 text-gray hover:text-primary transition-colors"
                    >
                      <Mail size={16} />
                      {entreprise.email}
                    </a>
                    <a
                      href={`tel:${entreprise.telephone}`}
                      className="flex items-center gap-2 text-gray hover:text-primary transition-colors"
                    >
                      <Phone size={16} />
                      {entreprise.telephone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Modifier les informations de l'entreprise</h2>
              <EditEntrepriseForm
                initialData={entreprise}
                onSubmit={handleEntrepriseUpdate}
              />
            </div>
          </TabsContent>

          <TabsContent value="stages">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Gestion des offres de stage</h2>
              <GestionStages
                stages={stages}
                onUpdate={handleStagesUpdate}
              />
            </div>
          </TabsContent>

          <TabsContent value="candidatures">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <GestionCandidatures
                candidatures={candidatures}
                onUpdateStatus={handleCandidatureStatusUpdate}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilEntreprise;
