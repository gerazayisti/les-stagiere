import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddRecommendationModal, Recommendation } from "./AddRecommendationModal";
import { Star, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompanyRecommendationsProps {
  companyId: string;
  companyName: string;
  companyLogo: string;
}

export function CompanyRecommendations({
  companyId,
  companyName,
  companyLogo,
}: CompanyRecommendationsProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterPosition, setFilterPosition] = useState<string>("all");

  // Simuler une liste de stagiaires (à remplacer par les vraies données)
  const stagiaires = [
    { id: "1", name: "Jean Dupont" },
    { id: "2", name: "Marie Martin" },
    { id: "3", name: "Paul Bernard" },
  ];

  const handleAddRecommendation = (
    newRecommendation: Omit<
      Recommendation,
      "id" | "companyId" | "companyName" | "companyLogo" | "date"
    >
  ) => {
    const recommendation: Recommendation = {
      id: Date.now().toString(),
      companyId,
      companyName,
      companyLogo,
      date: new Date().toISOString(),
      ...newRecommendation,
    };

    setRecommendations([recommendation, ...recommendations]);
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesSearch =
      rec.stagiaireName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      filterRating === "all" || rec.rating === parseInt(filterRating);

    const matchesPosition =
      filterPosition === "all" || rec.position === filterPosition;

    return matchesSearch && matchesRating && matchesPosition;
  });

  const getPositionLabel = (position: string) => {
    const positions: { [key: string]: string } = {
      stage_dev: "Stagiaire Développeur",
      stage_data: "Stagiaire Data Analyst",
      stage_design: "Stagiaire Designer",
      stage_marketing: "Stagiaire Marketing",
      stage_business: "Stagiaire Business",
      stage_other: "Autre",
    };
    return positions[position] || position;
  };

  const getPeriodLabel = (period: string) => {
    const periods: { [key: string]: string } = {
      "1_month": "1 mois",
      "2_months": "2 mois",
      "3_months": "3 mois",
      "4_months": "4 mois",
      "5_months": "5 mois",
      "6_months": "6 mois",
      "more_6_months": "Plus de 6 mois",
    };
    return periods[period] || period;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Recommandations</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une recommandation
        </Button>
      </div>

      {/* Filtres et recherche */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par note" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les notes</SelectItem>
            {[5, 4, 3, 2, 1].map((rating) => (
              <SelectItem key={rating} value={rating.toString()}>
                {rating} étoiles
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPosition} onValueChange={setFilterPosition}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par poste" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les postes</SelectItem>
            <SelectItem value="stage_dev">Développeur</SelectItem>
            <SelectItem value="stage_data">Data Analyst</SelectItem>
            <SelectItem value="stage_design">Designer</SelectItem>
            <SelectItem value="stage_marketing">Marketing</SelectItem>
            <SelectItem value="stage_business">Business</SelectItem>
            <SelectItem value="stage_other">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des recommandations */}
      {filteredRecommendations.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          {recommendations.length === 0
            ? "Aucune recommandation n'a encore été publiée."
            : "Aucune recommandation ne correspond aux critères de recherche."}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {recommendation.stagiaireName}
                      </h3>
                      <p className="text-muted-foreground">
                        {getPositionLabel(recommendation.position)} -{" "}
                        {getPeriodLabel(recommendation.period)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= recommendation.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-muted-foreground mb-4">
                    {recommendation.content}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {recommendation.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddRecommendationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddRecommendation}
        stagiaires={stagiaires}
      />
    </div>
  );
}
