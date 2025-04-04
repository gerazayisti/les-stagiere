
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddRecommendationModal } from "./AddRecommendationModal";
import { Lock, Star, Award, Building2, Calendar, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Recommendation } from "@/types/recommendations";

interface RecommendationsProps {
  recommendations: Recommendation[];
  isOwner: boolean;
  stagiaireId: string;
  isPremium?: boolean;
}

export function Recommendations({ recommendations = [], isOwner, stagiaireId, isPremium = false }: RecommendationsProps) {
  const [localRecommendations, setLocalRecommendations] = useState<Recommendation[]>(recommendations);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState<Recommendation | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLocalRecommendations(recommendations);
  }, [recommendations]);

  // Fonction pour récupérer les recommandations depuis la BD
  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          entreprises(name, logo_url)
        `)
        .eq('stagiaire_id', stagiaireId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Formater les données
      const formattedData = data.map((rec: any) => ({
        ...rec,
        entreprise_name: rec.entreprises?.name,
        entreprise_logo: rec.entreprises?.logo_url,
      }));

      setLocalRecommendations(formattedData);
    } catch (error) {
      console.error("Erreur lors de la récupération des recommandations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les recommandations",
        variant: "destructive",
      });
    }
  };

  // Fonction pour ajouter une recommandation
  const handleAddRecommendation = async (data: Omit<Recommendation, "id">) => {
    try {
      // Création de l'objet avec les propriétés requises mais pas forcément présentes dans data
      const completeData = {
        ...data,
        stagiaire_id: stagiaireId,
        is_public: true,
        updated_at: new Date().toISOString(),
        created_at: data.created_at || new Date().toISOString(),
        author_name: data.author_name || "",
        author_position: data.author_position || "",
        company_name: data.company_name || "",
      };

      const { data: responseData, error } = await supabase
        .from('recommendations')
        .insert(completeData)
        .select()
        .single();

      if (error) throw error;

      // Récupérer les informations de l'entreprise
      const { data: entrepriseData, error: entrepriseError } = await supabase
        .from('entreprises')
        .select('name, logo_url')
        .eq('id', data.entreprise_id)
        .single();

      if (entrepriseError) throw entrepriseError;

      // Ajouter la nouvelle recommandation à la liste
      const newRecommendation = {
        ...responseData,
        company_name: entrepriseData.name,
        company_logo: entrepriseData.logo_url
      };

      setLocalRecommendations([newRecommendation as Recommendation, ...localRecommendations]);
      toast({
        title: "Succès",
        description: "Recommandation ajoutée avec succès",
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la recommandation:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la recommandation",
        variant: "destructive",
      });
    }
  };

  const handleEditRecommendation = (recommendation: Recommendation) => {
    setEditingRecommendation(recommendation);
    setShowAddModal(true);
  };

  // Fonction pour mettre à jour la visibilité d'une recommandation
  const toggleRecommendationVisibility = async (id: string, isCurrentlyPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({ 
          is_public: !isCurrentlyPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Mettre à jour l'état local
      setLocalRecommendations(localRecommendations.map(rec => 
        rec.id === id ? { ...rec, is_public: !isCurrentlyPublic } : rec
      ));

      toast({
        title: "Succès",
        description: `Recommandation rendue ${!isCurrentlyPublic ? 'publique' : 'privée'}`,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la recommandation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la recommandation",
        variant: "destructive",
      });
    }
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

      {localRecommendations.length === 0 && isPremium ? (
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
          {localRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between">
                  <div className="flex items-center gap-4">
                    {recommendation.company_logo ? (
                      <img
                        src={recommendation.company_logo}
                        alt={recommendation.company_name || "Entreprise"}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {recommendation.company_name || "Entreprise"}
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
                    {recommendation.period || `${recommendation.start_date || ''} - ${recommendation.end_date || ''}`}
                  </span>
                </div>
                <p className="mb-4 text-muted-foreground whitespace-pre-wrap">
                  {recommendation.content}
                </p>

                {recommendation.skills && recommendation.skills.length > 0 && (
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

                {recommendation.achievements && recommendation.achievements.length > 0 && (
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRecommendationVisibility(recommendation.id, !!recommendation.is_public)}
                      >
                        {recommendation.is_public ? "Rendre privée" : "Rendre publique"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditRecommendation(recommendation)}
                      >
                        Modifier
                      </Button>
                    </div>
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
