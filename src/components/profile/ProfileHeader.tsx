
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/profile/Badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Lock, User } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProfileHeaderProps {
  stagiaire: any;
  isOwner: boolean;
  onEditClick: () => void;
}

export function ProfileHeader({ stagiaire, isOwner, onEditClick }: ProfileHeaderProps) {
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
