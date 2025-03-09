
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { InternshipOffer } from "@/types/project";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, Briefcase, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function InternshipOffersList({ companyId }: { companyId: string }) {
  const [offers, setOffers] = useState<InternshipOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from('stages')
          .select('*')
          .eq('entreprise_id', companyId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Erreur lors de la récupération des offres:", error);
          toast.error("Impossible de charger les offres de stage");
        } else {
          setOffers(data as unknown as InternshipOffer[]);
        }
      } catch (error) {
        console.error("Erreur inattendue:", error);
        toast.error("Une erreur est survenue lors du chargement des offres");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [companyId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 mb-2 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium mb-1">Aucune offre de stage</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cette entreprise n'a pas encore publié d'offres de stage.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <Card key={offer.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{offer.title}</CardTitle>
                <CardDescription className="mt-1">
                  Publié le {new Date(offer.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge
                variant={offer.status === 'active' ? 'default' : 
                       (offer.status === 'closed' ? 'destructive' : 'secondary')}
                className="ml-2"
              >
                {offer.status === 'active' ? 'Actif' : 
                 (offer.status === 'closed' ? 'Fermé' : 'Brouillon')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {offer.description}
            </p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{offer.location}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{offer.type}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{offer.duration}</span>
              </div>
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Début: {new Date(offer.start_date).toLocaleDateString()}</span>
              </div>
            </div>

            {offer.required_skills.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Compétences requises:</div>
                <div className="flex flex-wrap gap-1">
                  {offer.required_skills.map((skill, i) => (
                    <Badge key={i} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              <Users className="h-4 w-4 inline mr-1" /> 
              0 candidatures
            </div>
            <Button variant="outline" size="sm">
              Voir les détails
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
