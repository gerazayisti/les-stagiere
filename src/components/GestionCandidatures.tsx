
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  ChevronDown,
  Clock,
  MessageSquare,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { ProfilCandidat } from "./ProfilCandidat";
import { RecommendationForm } from "./profile/RecommendationForm";

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

export interface GestionCandidaturesProps {
  candidatures: Candidature[];
  onUpdateStatus: (
    candidatureId: string,
    newStatus: Candidature["status"]
  ) => void;
  onAddRecommendation: (candidatId: string) => void;
}

export function GestionCandidatures({
  candidatures,
  onUpdateStatus,
  onAddRecommendation,
}: GestionCandidaturesProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(
    null
  );
  const [selectedCandidature, setSelectedCandidature] =
    useState<Candidature | null>(null);
  const [isRecommendationFormOpen, setIsRecommendationFormOpen] =
    useState(false);

  const handleStatusChange = (candidatureId: string, newStatus: Candidature["status"]) => {
    onUpdateStatus(candidatureId, newStatus);
  };

  const handleRecommendation = (candidatId: string) => {
    onAddRecommendation(candidatId);
    setIsRecommendationFormOpen(false);
  };

  const openCandidatModal = (candidat: Candidat) => {
    setSelectedCandidat(candidat);
    setModalOpen(true);
  };

  const openRecommendationForm = (candidature: Candidature) => {
    setSelectedCandidature(candidature);
    setIsRecommendationFormOpen(true);
  };

  const getStatusBadge = (status: Candidature["status"]) => {
    switch (status) {
      case "en_attente":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case "acceptee":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Acceptée
          </Badge>
        );
      case "refusee":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Refusée
          </Badge>
        );
      case "en_discussion":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <MessageSquare className="h-3 w-3 mr-1" />
            En discussion
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Candidatures</CardTitle>
          <CardDescription>
            Gérez toutes vos candidatures de stage ici
          </CardDescription>
        </CardHeader>
        <CardContent>
          {candidatures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune candidature n'a été reçue pour le moment.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatures.map((candidature) => (
                  <TableRow key={candidature.id}>
                    <TableCell className="font-medium">
                      <div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => openCandidatModal(candidature.candidat)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={candidature.candidat.photo} />
                          <AvatarFallback>
                            {candidature.candidat.nom.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {candidature.candidat.nom}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {candidature.candidat.location || "Non spécifié"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{candidature.stageTitre}</TableCell>
                    <TableCell>
                      {candidature.datePostulation.toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(candidature.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <span className="sr-only">Ouvrir menu</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(candidature.id, "en_discussion")
                              }
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Mettre en discussion
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(candidature.id, "acceptee")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Accepter
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(candidature.id, "refusee")
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Refuser
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openRecommendationForm(candidature)}
                              disabled={candidature.candidat.hasRecommendation}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              {candidature.candidat.hasRecommendation
                                ? "Déjà recommandé"
                                : "Recommander"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal profil candidat */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCandidat && <ProfilCandidat candidat={selectedCandidat} />}
        </DialogContent>
      </Dialog>

      {/* Modal de recommandation */}
      <Dialog
        open={isRecommendationFormOpen}
        onOpenChange={setIsRecommendationFormOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter une recommandation</DialogTitle>
            <DialogDescription>
              Partagez votre expérience avec ce stagiaire pour l'aider dans sa
              recherche de stage.
            </DialogDescription>
          </DialogHeader>

          {selectedCandidature && (
            <RecommendationForm
              stagiaire={{
                id: selectedCandidature.candidat.id,
                name: selectedCandidature.candidat.nom,
              }}
              entreprise={{
                id: "current-company-id", // À remplacer par l'ID réel de l'entreprise
                name: "Votre Entreprise",
              }}
              stage={{
                title: selectedCandidature.stageTitre,
              }}
              onSubmit={(data) => {
                console.log("Recommandation soumise:", data);
                handleRecommendation(selectedCandidature.candidat.id);
              }}
              onCancel={() => setIsRecommendationFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
