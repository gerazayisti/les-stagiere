
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface AboutTabProps {
  bio?: string;
  education?: string;
  disponibility?: string;
  isPremium?: boolean;
  userId?: string;
}

export function AboutTab({ bio, education, disponibility = "upcoming", isPremium = false, userId }: AboutTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Biographie</h3>
          {bio ? (
            <p className="text-muted-foreground whitespace-pre-line">{bio}</p>
          ) : (
            <p className="text-muted-foreground italic">
              Aucune biographie disponible.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Formation</h3>
          {education ? (
            <p className="text-muted-foreground whitespace-pre-line">{education}</p>
          ) : (
            <p className="text-muted-foreground italic">
              Aucune information sur la formation disponible.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Disponibilité</h3>
          <Badge variant={disponibility === 'immediate' ? 'default' : 'outline'}>
            {disponibility === 'immediate' ? 'Disponible immédiatement' : 'Disponible prochainement'}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
