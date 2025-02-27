import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "./Badge";
import { Star, Quote, Calendar, Building2, Filter } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Recommendation {
  id: string;
  entreprise_id: string;
  position: string;
  department: string;
  period: string;
  start_date: string;
  end_date: string;
  rating: number;
  content: string;
  skills: string[];
  achievements: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  entreprise?: {
    name: string;
    logo_url: string;
  };
}

interface RecommendationsProps {
  recommendations: Recommendation[];
  isOwner: boolean;
  stagiaireId: string;
}

export function Recommendations({ recommendations, isOwner }: RecommendationsProps) {
  const [sortBy, setSortBy] = useState<"date" | "rating">("date");
  const [filterEntreprise, setFilterEntreprise] = useState<string>("all");

  // Extraire la liste unique des entreprises
  const entreprises = useMemo(() => {
    const uniqueEntreprises = new Set(
      recommendations.map((rec) => rec.entreprise?.name || "Inconnue")
    );
    return Array.from(uniqueEntreprises);
  }, [recommendations]);

  // Trier et filtrer les recommandations
  const sortedAndFilteredRecommendations = useMemo(() => {
    let filtered = recommendations;

    // Filtrer par entreprise
    if (filterEntreprise !== "all") {
      filtered = filtered.filter(
        (rec) => rec.entreprise?.name === filterEntreprise
      );
    }

    // Trier
    return [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return b.rating - a.rating;
    });
  }, [recommendations, sortBy, filterEntreprise]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recommandations</h2>
        <div className="flex gap-4">
          <Select value={sortBy} onValueChange={(value: "date" | "rating") => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="rating">Note</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterEntreprise} onValueChange={setFilterEntreprise}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par entreprise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les entreprises</SelectItem>
              {entreprises.map((entreprise) => (
                <SelectItem key={entreprise} value={entreprise}>
                  {entreprise}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6">
        {sortedAndFilteredRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={recommendation.entreprise?.logo_url} />
                <AvatarFallback>
                  {recommendation.entreprise?.name?.[0] || "E"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {recommendation.entreprise?.name || "Entreprise"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{recommendation.position}</span>
                      <span>•</span>
                      <span>{recommendation.department}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(recommendation.start_date)} - {formatDate(recommendation.end_date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < recommendation.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <Quote className="w-8 h-8 text-muted-foreground/20 mb-2" />
                  <p className="text-muted-foreground">{recommendation.content}</p>
                </div>

                {recommendation.skills && recommendation.skills.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Compétences démontrées</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {recommendation.achievements && recommendation.achievements.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Réalisations</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {recommendation.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
