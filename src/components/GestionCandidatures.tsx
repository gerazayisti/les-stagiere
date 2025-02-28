
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  MapPin,
  Star
} from "lucide-react";
import { ProfilCandidat } from "./ProfilCandidat";
import { ChatDiscussion } from "./ChatDiscussion";

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
  hasRecommendation?: boolean;
  location?: string;
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

interface GestionCandidaturesProps {
  candidatures: Candidature[];
  onUpdateStatus: (candidatureId: string, newStatus: Candidature["status"]) => void;
  onAddRecommendation: (candidatId: string) => void;
}

export function GestionCandidatures({
  candidatures,
  onUpdateStatus,
  onAddRecommendation,
}: GestionCandidaturesProps) {
  const [filter, setFilter] = useState<Candidature["status"] | "toutes">("toutes");
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(null);
  const [chatCandidature, setChatCandidature] = useState<Candidature | null>(null);

  const getStatusColor = (status: Candidature["status"]) => {
    switch (status) {
      case "en_attente":
        return "bg-yellow-100 text-yellow-800";
      case "acceptee":
        return "bg-green-100 text-green-800";
      case "refusee":
        return "bg-red-100 text-red-800";
      case "en_discussion":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Candidature["status"]) => {
    switch (status) {
      case "en_attente":
        return <Clock className="h-4 w-4" />;
      case "acceptee":
        return <CheckCircle className="h-4 w-4" />;
      case "refusee":
        return <XCircle className="h-4 w-4" />;
      case "en_discussion":
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: Candidature["status"]) => {
    switch (status) {
      case "en_attente":
        return "En attente";
      case "acceptee":
        return "Acceptée";
      case "refusee":
        return "Refusée";
      case "en_discussion":
        return "En discussion";
    }
  };

  const filteredCandidatures = filter === "toutes"
    ? candidatures
    : candidatures.filter((c) => c.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Candidatures</h2>
        <Select
          value={filter}
          onValueChange={(value: Candidature["status"] | "toutes") => setFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toutes">Toutes les candidatures</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
            <SelectItem value="en_discussion">En discussion</SelectItem>
            <SelectItem value="acceptee">Acceptées</SelectItem>
            <SelectItem value="refusee">Refusées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCandidatures.map((candidature) => (
          <Card key={candidature.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={candidature.candidat.photo}
                    alt={candidature.candidat.nom}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <CardTitle className="text-lg">
                      {candidature.candidat.nom}
                    </CardTitle>
                    <CardDescription>
                      Pour : {candidature.stageTitre}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(candidature.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(candidature.status)}
                    {getStatusText(candidature.status)}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {candidature.candidat.location || "Non spécifié"}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {candidature.candidat.competences.map((comp) => (
                    <Badge
                      key={comp}
                      variant="secondary"
                      className="text-xs"
                    >
                      {comp}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCandidat(candidature.candidat)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Voir le profil
                </Button>
                <Select
                  value={candidature.status}
                  onValueChange={(value: Candidature["status"]) =>
                    onUpdateStatus(candidature.id, value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Changer le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="en_discussion">En discussion</SelectItem>
                    <SelectItem value="acceptee">Accepter</SelectItem>
                    <SelectItem value="refusee">Refuser</SelectItem>
                  </SelectContent>
                </Select>
                {(candidature.status === "en_discussion" || candidature.status === "acceptee") && (
                  <>
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-1" />
                      CV
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setChatCandidature(candidature)}
                      className="w-full"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Discuter
                    </Button>
                  </>
                )}
                {candidature.status === "acceptee" && !candidature.candidat.hasRecommendation && (
                  <Button
                    variant="outline"
                    onClick={() => onAddRecommendation(candidature.candidat.id)}
                    className="w-full"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Recommander
                  </Button>
                )}
                {candidature.candidat.hasRecommendation && (
                  <div className="text-sm text-muted-foreground text-center">
                    Recommandation déjà donnée
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedCandidat && (
        <ProfilCandidat
          candidat={selectedCandidat}
          isOpen={!!selectedCandidat}
          onClose={() => setSelectedCandidat(null)}
        />
      )}

      {chatCandidature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <ChatDiscussion
              candidatureId={chatCandidature.id}
              entreprise={{
                id: "entreprise-1", 
                name: "TechCorp", 
                avatar: "https://via.placeholder.com/150",
              }}
              candidat={{
                id: chatCandidature.candidat.id,
                name: chatCandidature.candidat.nom,
                avatar: chatCandidature.candidat.photo
              }}
              onClose={() => setChatCandidature(null)}
            />
          </div>
        </div>
      )}

      {filteredCandidatures.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune candidature trouvée</p>
        </div>
      )}
    </div>
  );
}
