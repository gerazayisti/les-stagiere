import { useState } from "react";
import Navigation from "@/components/Navigation";
import { MapPin, GraduationCap, Calendar, Briefcase, Edit2 } from "lucide-react";
import { EditProfileForm } from "@/components/EditProfileForm";
import { CVAnalyzer } from "@/components/CVAnalyzer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfilStagiaire = () => {
  const [isEditing, setIsEditing] = useState(false);

  const stagiaire = {
    nom: "gervais azanga ",
    photo: "https://via.placeholder.com/150",
    titre: "Étudiant en Développement Web",
    localisation: "Yaounde, Cameroun",
    ecole: "École Supérieure d'Informatique",
    formation: "licence 2 Développement Web",
    disponibilite: "À partir de Mars 2024",
    competences: ["React", "TypeScript", "Node.js", "Python", "SQL", "Git"],
    experiences: [
      {
        id: 1,
        poste: "Développeur Web Junior",
        entreprise: "StartupTech",
        periode: "Juin - Août 2023",
        description: "Développement d'applications web avec React et Node.js",
      },
    ],
    formations: [
      {
        id: 1,
        diplome: "Master Développement Web",
        ecole: "École Supérieure d'Informatique",
        periode: "2022 - 2024",
      },
      {
        id: 2,
        diplome: "Licence Informatique",
        ecole: "Université de Paris",
        periode: "2019 - 2022",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="edit">Modifier le profil</TabsTrigger>
            <TabsTrigger value="cv">Analyse de CV</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Sidebar */}
              <div className="space-y-8">
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm animate-fade-in">
                  <div className="text-center">
                    <img
                      src={stagiaire.photo}
                      alt={stagiaire.nom}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
                      {stagiaire.nom}
                    </h1>
                    <p className="text-gray mb-4">{stagiaire.titre}</p>
                    <div className="flex flex-col gap-2 text-gray text-sm">
                      <span className="flex items-center justify-center gap-1">
                        <MapPin size={16} />
                        {stagiaire.localisation}
                      </span>
                      <span className="flex items-center justify-center gap-1">
                        <GraduationCap size={16} />
                        {stagiaire.ecole}
                      </span>
                      <span className="flex items-center justify-center gap-1">
                        <Calendar size={16} />
                        {stagiaire.disponibilite}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-3">Compétences</h2>
                    <div className="flex flex-wrap gap-2">
                      {stagiaire.competences.map((competence) => (
                        <span
                          key={competence}
                          className="px-3 py-1 bg-gray-light text-gray rounded-full text-sm"
                        >
                          {competence}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="md:col-span-2 space-y-8">
                {/* Experience */}
                <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Briefcase size={20} />
                    Expérience professionnelle
                  </h2>
                  <div className="space-y-6">
                    {stagiaire.experiences.map((experience) => (
                      <div key={experience.id} className="border-l-2 border-primary pl-4">
                        <h3 className="font-semibold">{experience.poste}</h3>
                        <p className="text-gray">{experience.entreprise}</p>
                        <p className="text-sm text-gray mb-2">{experience.periode}</p>
                        <p className="text-gray">{experience.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <GraduationCap size={20} />
                    Formation
                  </h2>
                  <div className="space-y-6">
                    {stagiaire.formations.map((formation) => (
                      <div key={formation.id} className="border-l-2 border-primary pl-4">
                        <h3 className="font-semibold">{formation.diplome}</h3>
                        <p className="text-gray">{formation.ecole}</p>
                        <p className="text-sm text-gray">{formation.periode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <EditProfileForm
                initialData={stagiaire}
                onSubmit={(data) => {
                  console.log("Saving profile data:", data);
                  // TODO: Implement save logic
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="cv">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <CVAnalyzer />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilStagiaire;
