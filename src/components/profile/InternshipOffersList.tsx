import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Clock, Briefcase, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternshipOffers } from "@/hooks/useInternshipOffers";

export function InternshipOffersList({ 
  companyId, 
  onStageSelect 
}: { 
  companyId: string, 
  onStageSelect?: (stage: any) => void 
}) {
  const { offers, loading, error } = useInternshipOffers(companyId);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-muted/50 dark:bg-zinc-900 dark:border-zinc-700">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 mb-2 text-muted-foreground dark:text-zinc-400 mx-auto" />
            <h3 className="text-lg font-medium mb-1 dark:text-white">Erreur de chargement</h3>
            <p className="text-sm text-muted-foreground dark:text-zinc-400 mb-4">
              Impossible de charger les offres de stage. Veuillez réessayer plus tard.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (offers.length === 0) {
    return (
      <Card className="bg-muted/50 dark:bg-zinc-900 dark:border-zinc-700">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 mb-2 text-muted-foreground dark:text-zinc-400 mx-auto" />
            <h3 className="text-lg font-medium mb-1 dark:text-white">Aucune offre de stage</h3>
            <p className="text-sm text-muted-foreground dark:text-zinc-400 mb-4">
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
        <Card key={offer.id} className="hover:shadow-md transition-shadow bg-white dark:bg-zinc-900 dark:border-zinc-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl dark:text-white">{offer.title}</CardTitle>
                <CardDescription className="mt-1 dark:text-zinc-400">
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
            <p className="text-sm text-muted-foreground dark:text-zinc-400 mb-4 line-clamp-2">
              {offer.description}
            </p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground dark:text-zinc-400" />
                <span className="dark:text-zinc-300">{offer.location}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-muted-foreground dark:text-zinc-400" />
                <span className="dark:text-zinc-300">{offer.type}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground dark:text-zinc-400" />
                <span className="dark:text-zinc-300">{offer.duration}</span>
              </div>
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground dark:text-zinc-400" />
                <span className="dark:text-zinc-300">Début: {new Date(offer.start_date).toLocaleDateString()}</span>
              </div>
            </div>

            {offer.required_skills && offer.required_skills.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2 dark:text-zinc-200">Compétences requises:</div>
                <div className="flex flex-wrap gap-1">
                  {offer.required_skills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="dark:border-zinc-600 dark:text-zinc-300">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground dark:text-zinc-400">
              <Users className="h-4 w-4 inline mr-1" /> 
              0 candidatures
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="dark:border-zinc-600 dark:text-zinc-200"
              onClick={() => onStageSelect && onStageSelect(offer)}
            >
              Voir les détails
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
