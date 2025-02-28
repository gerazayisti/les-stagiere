
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/profile/Badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileHeaderProps {
  stagiaire: any;
  isOwner: boolean;
  onEditClick: () => void;
  loading?: boolean;
  error?: string | null;
}

export function ProfileHeader({ stagiaire, isOwner, onEditClick, loading = false, error = null }: ProfileHeaderProps) {
  // Afficher un état de chargement
  if (loading) {
    return (
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Chargement du profil...</span>
        </div>
      </Card>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <Card className="p-6 mb-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Une erreur s'est produite lors du chargement du profil. Veuillez réessayer plus tard."}
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  // Vérifier si les données du stagiaire sont disponibles
  if (!stagiaire) {
    return (
      <Card className="p-6 mb-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Les informations du profil ne sont pas disponibles pour le moment.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={stagiaire.avatar_url} />
          <AvatarFallback>{stagiaire.name ? stagiaire.name[0] : 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h1 className="text-2xl font-bold">{stagiaire.name || "Utilisateur"}</h1>
            {stagiaire.is_premium && (
              <Badge variant="premium" />
            )}
          </div>
          <p className="text-muted-foreground">{stagiaire.title || "Étudiant(e)"}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 justify-center md:justify-start">
            {stagiaire.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{stagiaire.location}</span>
              </div>
            )}
            {stagiaire.education && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span>{stagiaire.education}</span>
              </div>
            )}
            {(stagiaire.disponibility || stagiaire.availability) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>{stagiaire.disponibility || stagiaire.availability || "Disponible"}</span>
              </div>
            )}
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={onEditClick}>
              Modifier le profil
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
