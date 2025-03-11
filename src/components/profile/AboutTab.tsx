
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface Education {
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
}

export interface ExtraInfo {
  label: string;
  value: any;
  isLink?: boolean;
}

export interface AboutTabProps {
  bio?: string;
  education?: Education[] | string;
  disponibility?: "immediate" | "upcoming";
  isPremium?: boolean;
  userId?: string;
  extraInfos?: ExtraInfo[];
  culture?: string;
  benefits?: string[];
}

export function AboutTab({ 
  bio, 
  education, 
  disponibility = "upcoming", 
  isPremium = false, 
  userId,
  extraInfos = [],
  culture,
  benefits = []
}: AboutTabProps) {
  // Convert education to a displayable format
  const renderEducation = () => {
    if (!education) {
      return (
        <p className="text-muted-foreground italic">
          Aucune information sur la formation disponible.
        </p>
      );
    }
    
    if (typeof education === 'string') {
      return <p className="text-muted-foreground whitespace-pre-line">{education}</p>;
    }
    
    if (Array.isArray(education) && education.length > 0) {
      return (
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
              <h4 className="font-medium">{edu.school}</h4>
              <p className="text-sm">{edu.degree} {edu.field && `en ${edu.field}`}</p>
              <p className="text-sm text-muted-foreground">
                {edu.start_date && new Date(edu.start_date).getFullYear()} 
                {edu.end_date ? ` - ${new Date(edu.end_date).getFullYear()}` : " - Présent"}
              </p>
              {edu.description && (
                <p className="text-sm mt-2 text-muted-foreground">{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <p className="text-muted-foreground italic">
        Aucune information sur la formation disponible.
      </p>
    );
  };

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

      {extraInfos && extraInfos.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Informations</h3>
            <dl className="space-y-2">
              {extraInfos.map((info, index) => (
                <div key={index} className="grid grid-cols-3 gap-4">
                  <dt className="col-span-1 font-medium text-muted-foreground">{info.label}</dt>
                  <dd className="col-span-2">
                    {info.isLink && info.value && info.value !== 'Non spécifié' ? (
                      <a 
                        href={info.value.startsWith('http') ? info.value : `https://${info.value}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <span>{info.value}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Formation</h3>
          {renderEducation()}
        </CardContent>
      </Card>

      {culture && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Culture d'entreprise</h3>
            <p className="text-muted-foreground whitespace-pre-line">{culture}</p>
          </CardContent>
        </Card>
      )}

      {benefits && benefits.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Avantages</h3>
            <div className="flex flex-wrap gap-2">
              {benefits.map((benefit, index) => (
                <Badge key={index} variant="secondary">{benefit}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
