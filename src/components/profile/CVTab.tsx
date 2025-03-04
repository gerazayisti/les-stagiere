
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { InteractiveCV } from "./InteractiveCV";
import { Plus, Upload, Lock } from "lucide-react";
import { CVAnalyzer } from "@/components/CVAnalyzer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface CVTabProps {
  userId: string;
  isPremium?: boolean;
}

export function CVTab({ userId, isPremium = false }: CVTabProps) {
  // Example CV URL - in a real application, this would be fetched from your database
  const [cvUrl, setCvUrl] = useState<string | undefined>(undefined);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  
  // This would be implemented to handle CV uploads in a real application
  const handleCVUpload = () => {
    console.log("CV upload for user:", userId);
    // Simulating a successful upload
    toast.success("CV téléchargé avec succès");
    setCvUrl("/sample-cv.pdf"); // This would be the actual URL in a real app
  };

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
      <div className="space-y-6 p-1">
        {!cvUrl && (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium">Aucun CV n'a été téléchargé</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Téléchargez votre CV pour le mettre à disposition des recruteurs
            </p>
            <Button onClick={handleCVUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Télécharger un CV
            </Button>
          </div>
        )}
        
        {cvUrl && (
          <div className="space-y-6">
            {isPremium ? (
              <>
                <InteractiveCV cvUrl={cvUrl} />
                <div className="flex justify-center mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAnalyzer(true)}
                  >
                    Analyser mon CV avec l'IA
                  </Button>
                </div>
                {showAnalyzer && (
                  <div className="mt-10">
                    <CVAnalyzer />
                  </div>
                )}
              </>
            ) : (
              <div className="border rounded-lg p-6 bg-muted/10">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-medium flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    CV interactif (Fonctionnalité Premium)
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Mettez en valeur votre parcours avec notre CV interactif et faites analyser 
                    votre CV par notre IA pour augmenter vos chances de décrocher un stage.
                  </p>
                  <Button 
                    variant="default"
                    onClick={() => window.location.href = "/abonnement"}
                  >
                    Passer à la version Premium
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
