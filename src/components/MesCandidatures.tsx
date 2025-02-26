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
import { ChatDiscussion } from "./ChatDiscussion";
import {
  Building2,
  MapPin,
  Calendar,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Entreprise {
  id: string;
  name: string;
  avatar?: string;
  localisation: string;
  secteur: string;
}

interface Stage {
  id: number;
  titre: string;
  entreprise: Entreprise;
  description: string;
  duree: string;
  dateDebut: Date;
  competencesRequises: string[];
  remuneration?: string;
}

interface Candidature {
  id: number;
  stage: Stage;
  status: "en_attente" | "acceptee" | "refusee" | "en_discussion";
  datePostulation: Date;
  lettreMotivation: string;
  cv: string;
}

interface MesCandidaturesProps {
  candidatures: Candidature[];
  stagiaire: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export function MesCandidatures({ candidatures, stagiaire }: MesCandidaturesProps) {
  const [filter, setFilter] = useState<Candidature["status"] | "toutes">("toutes");
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
        <h2 className="text-2xl font-semibold">Mes candidatures</h2>
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
                <div>
                  <CardTitle>{candidature.stage.titre}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Building2 className="h-4 w-4" />
                    {candidature.stage.entreprise.name}
                  </CardDescription>
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
                  {candidature.stage.entreprise.localisation}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Début : {candidature.stage.dateDebut.toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {candidature.stage.competencesRequises.map((comp) => (
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
            <CardFooter className="flex justify-between">
              {candidature.status === "en_discussion" && (
                <Button
                  variant="default"
                  onClick={() => setChatCandidature(candidature)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Discuter
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {chatCandidature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <ChatDiscussion
              candidatureId={chatCandidature.id}
              entreprise={chatCandidature.stage.entreprise}
              candidat={stagiaire}
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
