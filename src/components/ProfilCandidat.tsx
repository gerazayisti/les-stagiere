import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
} from "lucide-react";

interface Candidat {
  id: number;
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
  linkedin?: string;
  github?: string;
  portfolio?: string;
  localisation?: string;
  disponibilite?: string;
  projets?: Array<{
    titre: string;
    description: string;
    technologies: string[];
    lien?: string;
  }>;
  experiences?: Array<{
    poste: string;
    entreprise: string;
    periode: string;
    description: string;
  }>;
  formations?: Array<{
    diplome: string;
    ecole: string;
    periode: string;
    description?: string;
  }>;
}

interface ProfilCandidatProps {
  candidat: Candidat;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfilCandidat({ candidat, isOpen, onClose }: ProfilCandidatProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profil du candidat</DialogTitle>
          <DialogDescription>
            Candidature pour le poste de développeur
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <Tabs defaultValue="profil" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profil">Profil</TabsTrigger>
              <TabsTrigger value="experience">Expérience</TabsTrigger>
              <TabsTrigger value="formation">Formation</TabsTrigger>
              <TabsTrigger value="projets">Projets</TabsTrigger>
            </TabsList>

            <TabsContent value="profil">
              <div className="space-y-6">
                {/* En-tête du profil */}
                <div className="flex items-start gap-6">
                  <img
                    src={candidat.photo}
                    alt={candidat.nom}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">{candidat.nom}</h2>
                    <div className="flex items-center gap-2 text-gray-600">
                      {candidat.localisation && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {candidat.localisation}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-1" />
                        {candidat.email}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
                        {candidat.telephone}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Compétences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Compétences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidat.competences.map((comp) => (
                        <Badge key={comp} variant="secondary">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-4">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      CV
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Lettre de motivation
                    </Button>
                  </CardContent>
                </Card>

                {/* Disponibilité */}
                {candidat.disponibilite && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Disponibilité</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{candidat.disponibilite}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="experience">
              <div className="space-y-4">
                {candidat.experiences?.map((exp, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{exp.poste}</CardTitle>
                          <CardDescription>{exp.entreprise}</CardDescription>
                        </div>
                        <Badge variant="outline">{exp.periode}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{exp.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="formation">
              <div className="space-y-4">
                {candidat.formations?.map((formation, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{formation.diplome}</CardTitle>
                          <CardDescription>{formation.ecole}</CardDescription>
                        </div>
                        <Badge variant="outline">{formation.periode}</Badge>
                      </div>
                    </CardHeader>
                    {formation.description && (
                      <CardContent>
                        <p className="text-gray-600">{formation.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projets">
              <div className="space-y-4">
                {candidat.projets?.map((projet, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{projet.titre}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{projet.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {projet.technologies.map((tech) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      {projet.lien && (
                        <a
                          href={projet.lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-4 text-primary hover:underline"
                        >
                          Voir le projet
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
