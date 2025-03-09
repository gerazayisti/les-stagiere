
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Users, MapPin, Building2, Globe, Clock, BadgeCheck, 
  Heart, Edit, Flag, Share2, Mail, Plus
} from "lucide-react";
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CompanyRecommendations } from "@/components/profile/CompanyRecommendations";
import { InternshipOffersList } from "@/components/profile/InternshipOffersList";
import { AddInternshipOfferForm } from "@/components/profile/AddInternshipOfferForm";

interface EntrepriseData {
  id: string;
  name: string;
  email: string;
  logo_url?: string;
  industry?: string;
  location?: string;
  benefits?: string[];
  description?: string;
  size?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

interface InternData {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  skills?: string[];
  languages?: string[];
  preferred_locations?: string[];
  disponibility?: "immediate" | "upcoming";
  experience_years?: number;
  website?: string;
  github?: string;
  linkedin?: string;
  cv_url?: string;
  phone?: string;
  is_premium?: boolean;
  last_active?: string;
  created_at?: string;
  hasRecommendation: boolean;
}

export default function ProfilEntreprise() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [entreprise, setEntreprise] = useState<EntrepriseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [interns, setInterns] = useState<InternData[]>([]);

  useEffect(() => {
    if (!id) {
      console.error("ID d'entreprise manquant");
      toast.error("Impossible de charger le profil de l'entreprise");
      setLoading(false);
      return;
    }

    const fetchEntreprise = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('entreprises')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Erreur lors de la récupération de l'entreprise:", error);
          toast.error("Erreur lors du chargement du profil de l'entreprise");
        } else {
          setEntreprise(data);
        }
      } catch (error) {
        console.error("Erreur inconnue lors de la récupération de l'entreprise:", error);
        toast.error("Erreur inconnue lors du chargement du profil de l'entreprise");
      } finally {
        setLoading(false);
      }
    };

    const fetchInterns = async () => {
      try {
        const { data, error } = await supabase
          .from('stagiaires')
          .select('*')
          .limit(5);

        if (error) {
          console.error("Erreur lors de la récupération des stagiaires:", error);
          toast.error("Erreur lors du chargement des stagiaires");
        } else {
          setInterns(data);
        }
      } catch (error) {
        console.error("Erreur inconnue lors de la récupération des stagiaires:", error);
        toast.error("Erreur inconnue lors du chargement des stagiaires");
      }
    };

    fetchEntreprise();
    fetchInterns();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!entreprise) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent>
            <CardTitle>Entreprise non trouvée</CardTitle>
            <CardDescription>
              L'entreprise demandée n'existe pas ou a été supprimée.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={entreprise.logo_url} alt={entreprise.name} />
                <AvatarFallback>{entreprise.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg font-semibold">{entreprise.name}</CardTitle>
                <CardDescription className="text-gray-500">
                  {entreprise.industry} - {entreprise.location}
                </CardDescription>
              </div>
            </div>
            <div>
              {isAuthenticated && user?.role === 'stagiaire' && (
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Suivre
                </Button>
              )}
              {isAuthenticated && user?.id === entreprise.id && (
                <Button variant="secondary" size="sm" onClick={() => navigate(`/entreprises/${entreprise.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-md font-semibold mb-2">À propos de nous</h3>
              <p className="text-sm text-gray-700">{entreprise.description || "Aucune description disponible."}</p>
            </div>
            <div>
              <h3 className="text-md font-semibold mb-2">Informations</h3>
              <div className="flex items-center text-sm text-gray-700 mb-1">
                <Building2 className="h-4 w-4 mr-2" />
                Secteur: {entreprise.industry || "Non spécifié"}
              </div>
              <div className="flex items-center text-sm text-gray-700 mb-1">
                <MapPin className="h-4 w-4 mr-2" />
                Localisation: {entreprise.location || "Non spécifiée"}
              </div>
              <div className="flex items-center text-sm text-gray-700 mb-1">
                <Users className="h-4 w-4 mr-2" />
                Taille: {entreprise.size || "Non spécifiée"}
              </div>
              <div className="flex items-center text-sm text-gray-700 mb-1">
                <Globe className="h-4 w-4 mr-2" />
                Site web:{" "}
                <a href={entreprise.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {entreprise.website || "Non spécifié"}
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-700 mb-1">
                <Clock className="h-4 w-4 mr-2" />
                Membre depuis: {new Date(entreprise.created_at || '').toLocaleDateString()}
              </div>
              {entreprise.benefits && entreprise.benefits.length > 0 && (
                <div className="flex items-center text-sm text-gray-700 mb-1">
                  <BadgeCheck className="h-4 w-4 mr-2" />
                  Avantages: {entreprise.benefits.join(', ') || "Non spécifiés"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Mis à jour le: {new Date(entreprise.updated_at || '').toLocaleDateString()}
          </div>
          <div className="space-x-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              J'aime
            </Button>
            <Button variant="ghost" size="sm">
              <Flag className="h-4 w-4 mr-2" />
              Signaler
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
            <Button variant="ghost" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Contacter
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Tabs defaultValue="recommandations" className="w-full">
        <TabsList>
          <TabsTrigger value="recommandations">Recommandations</TabsTrigger>
          <TabsTrigger value="offres">Offres de stage</TabsTrigger>
          {isAuthenticated && user?.id === entreprise.id && (
            <TabsTrigger value="ajouter">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une offre
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="recommandations">
          <Card>
            <CardHeader>
              <CardTitle>Recommandations</CardTitle>
              <CardDescription>Ce que les autres disent de cette entreprise.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <CompanyRecommendations
                companyId={entreprise.id}
                companyName={entreprise.name}
                companyLogo={entreprise.logo_url || ""}
                interns={interns}
                userId={user?.id || ""}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="offres">
          <Card>
            <CardHeader>
              <CardTitle>Offres de stage</CardTitle>
              <CardDescription>Les offres de stage proposées par cette entreprise.</CardDescription>
            </CardHeader>
            <CardContent>
              <InternshipOffersList companyId={entreprise.id} />
            </CardContent>
          </Card>
        </TabsContent>
        {isAuthenticated && user?.id === entreprise.id && (
          <TabsContent value="ajouter">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter une offre de stage</CardTitle>
                <CardDescription>Créez une nouvelle offre de stage pour attirer les meilleurs talents.</CardDescription>
              </CardHeader>
              <CardContent>
                <AddInternshipOfferForm 
                  companyId={entreprise.id}
                  onSuccess={() => {
                    // Switch to the "offres" tab after successful creation
                    const offresTab = document.querySelector('[data-value="offres"]') as HTMLButtonElement;
                    if (offresTab) offresTab.click();
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
