
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number; // Ajout de la prop delay optionnelle
}

export function ServiceCard({ title, description, icon: Icon, delay }: ServiceCardProps) {
  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
