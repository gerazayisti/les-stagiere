
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Upload, File, Loader2 } from "lucide-react";

interface CandidatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageId: number;
  stageTitre: string;
}

const CandidatureModal = ({ isOpen, onClose, stageId, stageTitre }: CandidatureModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cv, setCV] = useState<File | null>(null);
  const [lettreMotivation, setLettreMotivation] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simuler l'envoi (à remplacer par l'intégration avec Supabase)
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Postuler au stage : {stageTitre}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="message">Message de candidature</Label>
            <Textarea
              id="message"
              placeholder="Présentez-vous brièvement..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>CV</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCV(e.target.files?.[0] || null)}
                  className="hidden"
                  id="cv-upload"
                />
                <Label
                  htmlFor="cv-upload"
                  className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <Upload size={16} />
                  Choisir un fichier
                </Label>
                {cv && (
                  <span className="flex items-center gap-2 text-sm text-gray">
                    <File size={16} />
                    {cv.name}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lettre de motivation</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setLettreMotivation(e.target.files?.[0] || null)}
                  className="hidden"
                  id="lm-upload"
                />
                <Label
                  htmlFor="lm-upload"
                  className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <Upload size={16} />
                  Choisir un fichier
                </Label>
                {lettreMotivation && (
                  <span className="flex items-center gap-2 text-sm text-gray">
                    <File size={16} />
                    {lettreMotivation.name}
                  </span>
                )}
              </div>
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
            <Button type="submit" disabled={isSubmitting || !cv}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Envoi en cours..." : "Envoyer ma candidature"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CandidatureModal;
