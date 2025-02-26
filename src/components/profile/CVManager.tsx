import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Upload,
  Trash2,
  AlertCircle,
  Lock,
  Bot,
} from "lucide-react";
import { CVAnalyzer } from "@/components/CVAnalyzer";

interface CV {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
}

interface CVManagerProps {
  isPremium: boolean;
  cvs: CV[];
  onUpload: (file: File) => void;
  onDelete: (cvId: string) => void;
}

export function CVManager({ isPremium, cvs, onUpload, onDelete }: CVManagerProps) {
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!isPremium && cvs.length >= 1) {
        alert("Version gratuite limitée à 1 CV. Passez à la version premium pour plus.");
        return;
      }
      onUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Mes CV</h3>
        <div className="flex items-center gap-4">
          {isPremium && (
            <Button
              onClick={() => setShowAnalyzer(true)}
              className="flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              Analyser mon CV
            </Button>
          )}
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Télécharger un CV
            </Button>
          </div>
        </div>
      </div>

      {!isPremium && cvs.length === 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-4 text-muted-foreground">
            <AlertCircle className="w-8 h-8" />
            <div>
              <p className="font-semibold">Version gratuite</p>
              <p>Vous pouvez télécharger 1 CV qui sera visible sur votre profil</p>
            </div>
          </div>
        </Card>
      )}

      {/* Liste des CV */}
      <div className="grid gap-4">
        {cvs.map((cv) => (
          <Card key={cv.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-medium">{cv.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Téléchargé le {cv.uploadDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(cv.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Overlay pour CVAnalyzer */}
      {showAnalyzer && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Analyse de CV</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAnalyzer(false)}
                >
                  ✕
                </Button>
              </div>
              <CVAnalyzer />
            </div>
          </Card>
        </div>
      )}

      {/* Message Premium pour l'analyseur de CV */}
      {!isPremium && (
        <Card className="p-6 border-primary/50">
          <div className="flex items-center gap-4">
            <Lock className="w-8 h-8 text-primary" />
            <div>
              <h4 className="font-semibold mb-1">Analyse IA de CV</h4>
              <p className="text-muted-foreground">
                Passez à la version premium pour accéder à l'analyse IA de votre CV
                et obtenir des recommandations personnalisées.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
