
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddRecommendationModal } from "./AddRecommendationModal";
import { Search, Star, User, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";

type Intern = {
  id: string;
  name: string;
  hasRecommendation: boolean;
};

export interface CompanyRecommendationsProps {
  userId: string;
  companyId?: string;
  companyName?: string;
  companyLogo?: string;
  interns?: Intern[];
  onMessageClick?: (entrepriseId: string) => Promise<void>;
  isPremium?: boolean;
}

export function CompanyRecommendations({
  userId,
  companyId,
  companyName,
  companyLogo,
  interns = [],
  onMessageClick,
  isPremium = false
}: CompanyRecommendationsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);

  const handleOpenModal = (intern: Intern) => {
    setSelectedIntern(intern);
    setShowAddModal(true);
  };

  const handleAddRecommendation = (data: any) => {
    console.log("Recommandation ajoutée:", data);
    setShowAddModal(false);
  };

  const filteredInterns = interns.filter((intern) =>
    intern.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Si nous sommes sur le profil d'un stagiaire
  if (!companyId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recommandations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Aucune entreprise n'a encore recommandé ce profil.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si nous sommes sur le profil d'une entreprise
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recommandations aux stagiaires</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Votre avis compte beaucoup pour nos stagiaires. Donnez-leur une
            recommandation pour valoriser leur travail et les aider dans leur
            recherche de stage.
          </p>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un stagiaire..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredInterns.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Aucun stagiaire trouvé</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Aucun stagiaire ne correspond à votre recherche ou vous n'avez
                pas encore recruté de stagiaires.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterns.map((intern) => (
                <div
                  key={intern.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{intern.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{intern.name}</p>
                    </div>
                  </div>
                  {intern.hasRecommendation ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Star className="h-4 w-4 fill-green-600" />
                      <span>Recommandé</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(intern)}
                    >
                      Recommander
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && selectedIntern && (
        <AddRecommendationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddRecommendation}
          initialData={null}
          stagiaire={{ id: selectedIntern.id, name: selectedIntern.name }}
          company={{ id: companyId, name: companyName || "", logo: companyLogo }}
        />
      )}
    </div>
  );
}
