import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import FormattedText from "@/components/FormattedText";
import { useSessionTimeout } from "@/contexts/SessionTimeoutContext";

// Types de contenu que l'IA peut générer
type ContentType = 'description' | 'responsibilities' | 'requirements';

interface AIStageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (content: string, type: ContentType) => void;
  contentType: ContentType;
  initialPrompt?: string;
}

const CONTENT_TYPE_LABELS = {
  description: "Description du stage",
  responsibilities: "Responsabilités",
  requirements: "Prérequis"
};

const CONTENT_TYPE_PLACEHOLDERS = {
  description: "Décrivez le contexte du stage (secteur, technologies, objectifs...)",
  responsibilities: "Décrivez les tâches principales que le stagiaire devra accomplir",
  requirements: "Décrivez le profil recherché (compétences, formation, qualités...)"
};

const EXAMPLE_PROMPTS = {
  description: [
    "Stage de développement web dans une startup fintech",
    "Stage en marketing digital pour une agence de communication",
    "Stage d'ingénieur data science dans le secteur de la santé"
  ],
  responsibilities: [
    "Développement d'une application web avec React et Node.js",
    "Gestion de campagnes marketing sur les réseaux sociaux",
    "Analyse de données et création de modèles prédictifs"
  ],
  requirements: [
    "Étudiant en informatique avec des connaissances en JavaScript",
    "Formation en marketing digital et maîtrise des outils d'analyse",
    "Compétences en statistiques et programmation Python"
  ]
};

// Simulation de génération par IA (à remplacer par une vraie API)
const simulateAIGeneration = async (prompt: string, type: ContentType): Promise<string> => {
  // Simuler un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Exemples de réponses formatées selon le type de contenu
  const responses = {
    description: `Nous recherchons un(e) stagiaire passionné(e) pour rejoindre notre équipe dynamique et participer au développement de nos projets innovants.

Ce stage vous permettra de mettre en pratique vos connaissances théoriques dans un environnement professionnel stimulant, tout en développant de nouvelles compétences techniques et relationnelles.

Vous serez intégré(e) à notre équipe et travaillerez en étroite collaboration avec nos experts, qui vous accompagneront tout au long de votre stage.

Nous valorisons la créativité, l'autonomie et l'esprit d'équipe, et nous vous encouragerons à proposer vos idées et à prendre des initiatives.`,

    responsibilities: `• Participer au développement de nouvelles fonctionnalités
• Collaborer avec l'équipe de design pour implémenter les maquettes
• Effectuer des tests et corriger les bugs identifiés
• Optimiser les performances de l'application
• Participer aux réunions d'équipe et aux sessions de code review
• Documenter le code et les processus
• Proposer des améliorations techniques et fonctionnelles`,

    requirements: `• En cours de formation Bac+4/5 en informatique ou école d'ingénieur
• Première expérience en développement (stage, projet personnel, contribution open source)
• Connaissance des technologies web modernes (JavaScript, HTML, CSS)
• Intérêt pour les frameworks front-end (React, Vue.js, Angular)
• Autonomie et esprit d'équipe
• Curiosité et envie d'apprendre
• Bon niveau d'anglais technique`
  };
  
  return responses[type];
};

export function AIStageGenerator({ 
  isOpen, 
  onClose, 
  onGenerated, 
  contentType,
  initialPrompt = ""
}: AIStageGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [copied, setCopied] = useState(false);
  const { resetTimer } = useSessionTimeout();

  const handleGenerate = async () => {
    resetTimer();
    setIsGenerating(true);
    try {
      const content = await simulateAIGeneration(prompt, contentType);
      setGeneratedContent(content);
      setActiveTab("preview");
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseContent = () => {
    resetTimer();
    onGenerated(generatedContent, contentType);
    onClose();
  };

  const handleCopyContent = () => {
    resetTimer();
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExampleClick = (example: string) => {
    resetTimer();
    setPrompt(example);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      resetTimer();
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Générer {CONTENT_TYPE_LABELS[contentType].toLowerCase()} avec l'IA
          </DialogTitle>
          <DialogDescription>
            Décrivez ce que vous souhaitez générer, et notre IA créera un contenu professionnel et formaté.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="prompt">Votre demande</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => {
                resetTimer();
                setPrompt(e.target.value);
              }}
              placeholder={CONTENT_TYPE_PLACEHOLDERS[contentType]}
              className="h-24 mb-2"
            />
            <div className="text-sm text-gray-500 mb-2">Exemples :</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {EXAMPLE_PROMPTS[contentType].map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(example)}
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
          
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Générer le contenu
              </>
            )}
          </Button>
          
          {generatedContent && (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "preview")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Éditer</TabsTrigger>
                <TabsTrigger value="preview">Aperçu formaté</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyContent}
                    className="flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copier
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={generatedContent}
                  onChange={(e) => {
                    resetTimer();
                    setGeneratedContent(e.target.value);
                  }}
                  className="min-h-[200px]"
                />
              </TabsContent>
              <TabsContent value="preview" className="border rounded-md p-4 min-h-[200px]">
                <FormattedText text={generatedContent} highlightKeywords={true} />
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleUseContent} 
            disabled={!generatedContent}
          >
            Utiliser ce contenu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AIStageGenerator;
