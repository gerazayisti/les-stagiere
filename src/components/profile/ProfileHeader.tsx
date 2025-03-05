
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GlobeIcon, MapPin, Briefcase, Mail, Linkedin, Github, Globe } from "lucide-react";

export interface ProfileHeaderProps {
  name: string;
  avatarUrl: string;
  bio: string;
  location: string;
  socials: {
    website: string;
    github: string;
    linkedin: string;
  };
  editable?: boolean;
  onEdit?: () => void;
}

export function ProfileHeader({
  name,
  avatarUrl,
  bio,
  location,
  socials,
  editable = false,
  onEdit
}: ProfileHeaderProps) {
  const avatarFallback = name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <Card className="relative p-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-blue-500 to-violet-500"></div>
      
      <div className="flex flex-col sm:flex-row gap-6 mt-6 relative">
        <Avatar className="h-24 w-24 border-4 border-background">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <div className="flex items-center text-muted-foreground mt-1">
                {location && (
                  <div className="flex items-center mr-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </div>
            
            {editable && (
              <Button onClick={onEdit} variant="outline" className="sm:self-start">
                Modifier le profil
              </Button>
            )}
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground">{bio}</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {socials.website && (
              <a 
                href={socials.website.startsWith('http') ? socials.website : `https://${socials.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <Globe className="h-4 w-4 mr-1" />
                <span>Site web</span>
              </a>
            )}
            
            {socials.github && (
              <a 
                href={socials.github.startsWith('http') ? socials.github : `https://github.com/${socials.github}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <Github className="h-4 w-4 mr-1" />
                <span>GitHub</span>
              </a>
            )}
            
            {socials.linkedin && (
              <a 
                href={socials.linkedin.startsWith('http') ? socials.linkedin : `https://linkedin.com/in/${socials.linkedin}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="h-4 w-4 mr-1" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
