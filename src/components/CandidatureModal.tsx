
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Upload, File, Loader2, Check, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCandidatures } from "@/hooks/useCandidatures";
import { supabase } from "@/lib/supabase";

interface CandidatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageId: number;
  stageTitre: string;
}

const CandidatureModal = ({ isOpen, onClose, stageId, stageTitre }: CandidatureModalProps) => {
  const { user } = useAuth();
  const { createCandidature } = useCandidatures();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cv, setCV] = useState<File | string | null>(null);
  const [lettreMotivation, setLettreMotivation] = useState<File | string | null>(null);
  const [message, setMessage] = useState("");
  const [useExistingCV, setUseExistingCV] = useState(false);
  const [useExistingLM, setUseExistingLM] = useState(false);
  const [existingCV, setExistingCV] = useState<{id: string, file_url: string, name?: string} | null>(null);
  const [existingLM, setExistingLM] = useState<{id: string, file_url: string, name?: string} | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Récupérer les documents existants du profil
  useEffect(() => {
    if (isOpen && user) {
      fetchExistingDocuments();
    }
  }, [isOpen, user]);

  const fetchExistingDocuments = async () => {
    if (!user) return;
    
    setLoadingDocs(true);
    try {
      // Récupérer le CV existant
      const { data: cvData, error: cvError } = await supabase
        .from('documents')
        .select('id, file_url, name')
        .eq('stagiaire_id', user.id)
        .eq('type', 'CV')
        .eq('is_primary', true)
        .order('upload_date', { ascending: false })
        .limit(1);

      if (cvError) throw cvError;
      
      if (cvData && cvData.length > 0) {
        setExistingCV(cvData[0]);
      }

      // Récupérer la lettre de motivation existante
      const { data: lmData, error: lmError } = await supabase
        .from('documents')
        .select('id, file_url, name')
        .eq('stagiaire_id', user.id)
        .eq('type', 'Lettre de motivation')
        .eq('is_primary', true)
        .order('upload_date', { ascending: false })
        .limit(1);

      if (lmError) throw lmError;
      
      if (lmData && lmData.length > 0) {
        setExistingLM(lmData[0]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      toast.error("Impossible de récupérer vos documents existants");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!user) {
        throw new Error("Vous devez être connecté pour postuler");
      }

      // Préparer les documents à envoyer
      const cvToSend = useExistingCV && existingCV ? existingCV.id : cv;
      const lmToSend = useExistingLM && existingLM ? existingLM.id : lettreMotivation;

      // Créer la candidature
      const result = await createCandidature({
        stage_id: stageId.toString(),
        stagiaire_id: user.id,
        cv: cvToSend,
        lettre_motivation: lmToSend,
        use_existing_documents: useExistingCV || useExistingLM
      });

      if (!result) {
        throw new Error("Erreur lors de l'envoi de votre candidature");
      }

      toast.success("Votre candidature a été envoyée avec succès");
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de la candidature:", error);
      toast.error(error.message || "Erreur lors de l'envoi de votre candidature");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Postuler au stage : {stageTitre}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-6 p-1">
            <div className="space-y-2">
              <Label htmlFor="message">Message de candidature</Label>
              <Textarea
                id="message"
                placeholder="Présentez-vous brièvement..."
                className="min-h-[100px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isSubmitting || loadingDocs}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>CV</Label>
                  {existingCV && (
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="use-existing-cv" 
                        checked={useExistingCV}
                        onCheckedChange={(checked) => {
                          setUseExistingCV(checked === true);
                          if (checked) setCV(null);
                        }}
                      />
                      <Label htmlFor="use-existing-cv" className="text-sm cursor-pointer">
                        Utiliser mon CV existant
                      </Label>
                    </div>
                  )}
                </div>
                
                {useExistingCV && existingCV ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm">
                      {existingCV.name || "CV existant"}
                    </span>
                    <a 
                      href={existingCV.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-blue-500 hover:underline"
                    >
                      Voir
                    </a>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="p-1 h-auto" 
                      onClick={() => setUseExistingCV(false)}
                    >
                      <RefreshCw size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        setCV(e.target.files?.[0] || null);
                        setUseExistingCV(false);
                      }}
                      className="hidden"
                      id="cv-upload"
                      disabled={isSubmitting || loadingDocs}
                    />
                    <Label
                      htmlFor="cv-upload"
                      className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Upload size={16} />
                      Choisir un fichier
                    </Label>
                    {cv && typeof cv !== 'string' && (
                      <span className="flex items-center gap-2 text-sm text-gray">
                        <File size={16} />
                        {cv.name}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Lettre de motivation</Label>
                  {existingLM && (
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="use-existing-lm" 
                        checked={useExistingLM}
                        onCheckedChange={(checked) => {
                          setUseExistingLM(checked === true);
                          if (checked) setLettreMotivation(null);
                        }}
                      />
                      <Label htmlFor="use-existing-lm" className="text-sm cursor-pointer">
                        Utiliser ma lettre existante
                      </Label>
                    </div>
                  )}
                </div>
                
                {useExistingLM && existingLM ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm">
                      {existingLM.name || "Lettre de motivation existante"}
                    </span>
                    <a 
                      href={existingLM.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-blue-500 hover:underline"
                    >
                      Voir
                    </a>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="p-1 h-auto" 
                      onClick={() => setUseExistingLM(false)}
                    >
                      <RefreshCw size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        setLettreMotivation(e.target.files?.[0] || null);
                        setUseExistingLM(false);
                      }}
                      className="hidden"
                      id="lm-upload"
                      disabled={isSubmitting || loadingDocs}
                    />
                    <Label
                      htmlFor="lm-upload"
                      className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Upload size={16} />
                      Choisir un fichier
                    </Label>
                    {lettreMotivation && typeof lettreMotivation !== 'string' && (
                      <span className="flex items-center gap-2 text-sm text-gray">
                        <File size={16} />
                        {lettreMotivation.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || (!cv && !useExistingCV) || loadingDocs}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loadingDocs && "Chargement des documents..."}
                {!loadingDocs && (isSubmitting ? "Envoi en cours..." : "Envoyer ma candidature")}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CandidatureModal;
