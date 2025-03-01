
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Eye,
  FileText,
  MessageCircle,
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Star,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Hourglass,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
export interface Candidat {
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

export interface Candidature {
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
  onAddRecommendation?: (candidatId: string) => void;
}

export function GestionCandidatures({
  candidatures,
  onUpdateStatus,
  onAddRecommendation,
}: GestionCandidaturesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedCandidature, setSelectedCandidature] =
    useState<Candidature | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [selectedCandidat, setSelectedCandidat] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleViewDetails = (candidature: Candidature) => {
    setSelectedCandidature(candidature);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (newStatus: Candidature["status"]) => {
    if (selectedCandidature) {
      onUpdateStatus(selectedCandidature.id, newStatus);
      // Update local state too
      setSelectedCandidature({
        ...selectedCandidature,
        status: newStatus,
      });
    }
  };

  const handleAddRecommendation = (candidat: Candidat) => {
    setSelectedCandidat({
      id: candidat.id,
      name: candidat.nom,
    });
    setShowRecommendationForm(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  const getStatusBadge = (status: Candidature["status"]) => {
    switch (status) {
      case "en_attente":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Hourglass className="h-3 w-3" /> En attente
          </Badge>
        );
      case "acceptee":
        return (
          <Badge variant="success" className="flex items-center gap-1 bg-green-500 text-white">
            <CheckCircle2 className="h-3 w-3" /> Acceptée
          </Badge>
        );
      case "refusee":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Refusée
          </Badge>
        );
      case "en_discussion":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-blue-500">
            <MessageSquare className="h-3 w-3" /> En discussion
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredCandidatures = candidatures.filter((candidature) => {
    const matchesSearch =
      candidature.candidat.nom
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      candidature.stageTitre.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" || candidature.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Candidatures</CardTitle>
          <CardDescription>
            Gérez les candidatures pour vos offres de stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou poste..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-64">
              <Select
                value={filter}
                onValueChange={handleFilterChange}
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Filtrer par statut" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="en_discussion">En discussion</SelectItem>
                  <SelectItem value="acceptee">Acceptée</SelectItem>
                  <SelectItem value="refusee">Refusée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredCandidatures.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">
                Aucune candidature trouvée
              </h3>
              <p className="text-gray-500">
                {searchTerm || filter !== "all"
                  ? "Essayez de modifier vos filtres de recherche"
                  : "Vous n'avez pas encore reçu de candidatures"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidat</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidatures.map((candidature) => (
                    <TableRow key={candidature.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={candidature.candidat.photo} />
                            <AvatarFallback>
                              {candidature.candidat.nom
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {candidature.candidat.nom}
                              {candidature.candidat.hasRecommendation && (
                                <Star className="h-4 w-4 text-yellow-400 inline ml-1" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {candidature.candidat.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{candidature.stageTitre}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {candidature.datePostulation.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(candidature.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(candidature)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(candidature)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir le profil
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger CV
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Contacter
                              </DropdownMenuItem>
                              {!candidature.candidat.hasRecommendation &&
                                onAddRecommendation && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAddRecommendation(
                                        candidature.candidat
                                      )
                                    }
                                  >
                                    <Star className="mr-2 h-4 w-4" />
                                    Recommander
                                  </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Détails de la candidature */}
      {selectedCandidature && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de la candidature</DialogTitle>
              <DialogDescription>
                Candidature pour le poste de{" "}
                <span className="font-medium">
                  {selectedCandidature.stageTitre}
                </span>
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="profile" className="mt-4">
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="historique">Historique</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-24 w-24">
                            <AvatarImage
                              src={selectedCandidature.candidat.photo}
                            />
                            <AvatarFallback>
                              {selectedCandidature.candidat.nom
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="mt-4 text-xl font-bold">
                            {selectedCandidature.candidat.nom}
                            {selectedCandidature.candidat.hasRecommendation && (
                              <Star className="h-5 w-5 text-yellow-400 inline ml-1" />
                            )}
                          </h3>
                          <div className="mt-1 text-muted-foreground">
                            {selectedCandidature.candidat.experience}
                          </div>

                          <div className="mt-6 space-y-2 w-full">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={`mailto:${selectedCandidature.candidat.email}`}
                                className="text-primary hover:underline"
                              >
                                {selectedCandidature.candidat.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={`tel:${selectedCandidature.candidat.telephone}`}
                                className="text-primary hover:underline"
                              >
                                {selectedCandidature.candidat.telephone}
                              </a>
                            </div>
                            {selectedCandidature.candidat.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {selectedCandidature.candidat.location}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {selectedCandidature.candidat.disponibilite}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="md:w-2/3 space-y-6">
                        <div>
                          <h4 className="text-lg font-medium mb-2">
                            Formation
                          </h4>
                          <p>{selectedCandidature.candidat.formation}</p>
                        </div>

                        <div>
                          <h4 className="text-lg font-medium mb-2">
                            Compétences
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidature.candidat.competences.map(
                              (competence, index) => (
                                <Badge key={index} variant="secondary">
                                  {competence}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-medium mb-2">
                            Lettre de motivation
                          </h4>
                          <div className="bg-muted p-4 rounded-md">
                            <p className="whitespace-pre-line">
                              {selectedCandidature.candidat.lettre}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardContent className="p-6">
                    <div className="grid gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <div className="font-medium">CV</div>
                            <div className="text-sm text-muted-foreground">
                              PDF - 2.4 MB
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" /> Télécharger
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historique">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Candidature reçue</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedCandidature.datePostulation.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex justify-between">
              <div>
                <p className="text-sm font-medium mb-2">Statut actuel:</p>
                {getStatusBadge(selectedCandidature.status)}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("refusee")}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  <ThumbsDown className="mr-2 h-4 w-4" /> Refuser
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("en_discussion")}
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Discuter
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleStatusChange("acceptee")}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" /> Accepter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Formulaire de recommandation */}
      {selectedCandidat && (
        <Dialog
          open={showRecommendationForm}
          onOpenChange={setShowRecommendationForm}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recommander {selectedCandidat.name}</DialogTitle>
              <DialogDescription>
                Ajoutez une recommandation professionnelle pour ce candidat
              </DialogDescription>
            </DialogHeader>
            
            {/* Placeholder du formulaire de recommandation */}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="recommendation" className="text-sm font-medium">
                  Votre recommandation
                </label>
                <textarea
                  id="recommendation"
                  className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder="Partagez votre expérience avec ce candidat..."
                ></textarea>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="relation" className="text-sm font-medium">
                  Relation avec le candidat
                </label>
                <Select defaultValue="superviseur">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une relation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superviseur">Superviseur</SelectItem>
                    <SelectItem value="collegue">Collègue</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRecommendationForm(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={() => {
                  if (onAddRecommendation && selectedCandidat) {
                    onAddRecommendation(selectedCandidat.id);
                    setShowRecommendationForm(false);
                  }
                }}
              >
                Publier la recommandation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
