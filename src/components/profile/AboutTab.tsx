
import { Badge } from "@/components/profile/Badge";
import { Card } from "@/components/ui/card";

interface AboutTabProps {
  bio: string;
  skills: string[];
  languages: string[];
  preferredLocations: string[];
}

export function AboutTab({ bio, skills, languages, preferredLocations }: AboutTabProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">À propos</h2>
      <p className="text-muted-foreground whitespace-pre-wrap">{bio}</p>

      {skills && skills.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Compétences</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index}>{skill}</Badge>
            ))}
          </div>
        </div>
      )}

      {languages && languages.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Langues</h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((language, index) => (
              <Badge key={index} variant="outline">{language}</Badge>
            ))}
          </div>
        </div>
      )}

      {preferredLocations && preferredLocations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Localisations préférées</h3>
          <div className="flex flex-wrap gap-2">
            {preferredLocations.map((location, index) => (
              <Badge key={index} variant="secondary">{location}</Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
