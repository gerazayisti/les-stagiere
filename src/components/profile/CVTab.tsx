
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { InteractiveCV } from "./InteractiveCV";
import { Plus } from "lucide-react";

export interface CVTabProps {
  userId: string;
  isPremium?: boolean;
}

export function CVTab({ userId, isPremium = false }: CVTabProps) {
  // Example CV URL - in a real application, this would be fetched from your database
  const [cvUrl, setCvUrl] = useState<string | undefined>(undefined);
  
  // This would be implemented to handle CV uploads in a real application
  const handleCVUpload = () => {
    console.log("CV upload for user:", userId);
    // Implementation of file upload logic would go here
  };

  return (
    <div className="space-y-6">
      {!cvUrl && (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium">Aucun CV n'a été téléchargé</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            Téléchargez votre CV pour le mettre à disposition des recruteurs
          </p>
          <Button onClick={handleCVUpload}>
            <Plus className="mr-2 h-4 w-4" />
            Télécharger un CV
          </Button>
        </div>
      )}
      
      <InteractiveCV cvUrl={cvUrl} />
    </div>
  );
}
