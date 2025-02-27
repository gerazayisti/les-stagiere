
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddRecommendationModal } from "./AddRecommendationModal";
import { Lock, Star, Award, Building2, Calendar, Info } from "lucide-react";

// Structure des recommandations complète
interface Recommendation {
  id: string;
  entreprise_id: string;
  entreprise_name?: string;
  entreprise_logo?: string;
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
}

// Type pour la création d'une nouvelle recommandation
type NewRecommendation = Omit<Recommendation, "id" | "entreprise_name" | "entreprise_logo" | "created_at" | "updated_at">;

interface RecommendationsProps {
  recommendations: Recommendation[];
  isOwner: boolean;
  stagiaireId: string;
  isPremium?: boolean;
}

export function Recommendations({ recommendations = [], isOwner, stagiaireId, isPremium = false }: RecommendationsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState<Recommendation | null>(null);

  const handleAddRecommendation = (recommendation: NewRecommendation) => {
    // Cette fonction sera implémentée pour ajouter une recommandation à la base de données
    console.log("Ajouter recommandation:", recommendation);
    setShowAddModal(false);
  };

  const handleEditRecommendation = (recommendation: Recommendation) => {
    setEditingRecommendation(recommendation);
    setShowAddModal(true);
  };

  // Fonction pour rendre les étoiles selon la note (rating)
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recommandations</h2>
        {isOwner && isPremium && (
          <Button onClick={() => setShowAddModal(true)}>
            Demander une recommandation
          </Button>
        )}
      </div>

      {!isPremium && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Lock className="w-8 h-8 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Fonctionnalité premium</h3>
                <p className="text-muted-foreground mb-4">
                  Les recommandations vérifiées sont disponibles uniquement pour les utilisateurs premium.
                  Elles permettent de prouver votre expérience et vos compétences auprès des recruteurs.
                </p>
                <Button>Passer à la version premium</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.length === 0 && isPremium ? (
        <Card className="p-6 text-center">
          <div className="py-12">
            <Award className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">Aucune recommandation</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isOwner
                ? "Demandez des recommandations à vos anciens maîtres de stage ou employeurs pour renforcer votre profil."
                : "Ce profil n'a pas encore reçu de recommandations."}
            </p>
            {isOwner && (
              <Button
                className="mt-4"
                onClick={() => setShowAddModal(true)}
              >
                Demander ma première recommandation
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {recommendations.map((recommendation) => (
            <Card key={recommendation.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between">
                  <div className="flex items-center gap-4">
                    {recommendation.entreprise_logo ? (
                      <img
                        src={recommendation.entreprise_logo}
                        alt={recommendation.entreprise_name || "Entreprise"}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {recommendation.entreprise_name || "Entreprise"}
                      </CardTitle>
                      <CardDescription>
                        {recommendation.position} • {recommendation.department}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(recommendation.rating)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    {recommendation.period || `${recommendation.start_date} - ${recommendation.end_date}`}
                  </span>
                </div>
                <p className="mb-4 text-muted-foreground whitespace-pre-wrap">
                  {recommendation.content}
                </p>

                {recommendation.skills?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Compétences</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {recommendation.achievements?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Réalisations</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {recommendation.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              {isOwner && (
                <CardFooter className="bg-muted/50 px-6 py-3">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Info className="w-4 h-4" />
                      <span>
                        {recommendation.is_public
                          ? "Cette recommandation est publique"
                          : "Cette recommandation est privée"}
                      </span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleEditRecommendation(recommendation)}>
                      Modifier
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </>
      )}

      {showAddModal && (
        <AddRecommendationModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingRecommendation(null);
          }}
          onSubmit={handleAddRecommendation}
          initialData={editingRecommendation}
          stagiaire={{ id: stagiaireId }}
        />
      )}
    </div>
  );
}
