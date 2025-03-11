import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Upload, 
  Edit3, 
  FileCheck, 
  FileX 
} from 'lucide-react';
import { useCandidatures } from '@/hooks/useCandidatures';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface PostulerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageId: string;
}

export const PostulerModal: React.FC<PostulerModalProps> = ({ 
  open, 
  onOpenChange, 
  stageId 
}) => {
  const { user } = useAuth();
  const { createCandidature } = useCandidatures();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [lettreMotivationFile, setLettreMotivationFile] = useState<File | null>(null);
  const [lettreMotivationText, setLettreMotivationText] = useState<string>('');
  const cvInputRef = useRef<HTMLInputElement>(null);
  const lettreMotivationInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (type: 'cv' | 'lettre_motivation', file: File | null) => {
    if (type === 'cv') {
      setCvFile(file);
    } else {
      setLettreMotivationFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour postuler');
      return;
    }

    try {
      await createCandidature({
        stage_id: stageId,
        stagiaire_id: user.id,
        cv: cvFile,
        lettre_motivation: lettreMotivationFile || lettreMotivationText,
        status: 'en_attente'
      });

      toast.success('Votre candidature a été soumise avec succès');
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de la soumission de la candidature');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Postuler pour ce stage</DialogTitle>
          <DialogDescription>
            Téléchargez votre CV et votre lettre de motivation ou rédigez-la directement.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="upload" className="w-full">
              <Upload className="mr-2 h-4 w-4" /> Télécharger des documents
            </TabsTrigger>
            <TabsTrigger value="write" className="w-full">
              <Edit3 className="mr-2 h-4 w-4" /> Rédiger en ligne
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="space-y-4">
              <div>
                <Label htmlFor="cv">CV</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="cv"
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    ref={cvInputRef}
                    onChange={(e) => handleFileUpload('cv', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => cvInputRef.current?.click()}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {cvFile ? cvFile.name : 'Sélectionner un CV'}
                  </Button>
                  {cvFile && <FileCheck className="text-green-500" />}
                  {!cvFile && <FileX className="text-red-500" />}
                </div>
              </div>

              <div>
                <Label htmlFor="lettre_motivation">Lettre de motivation</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="lettre_motivation"
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    ref={lettreMotivationInputRef}
                    onChange={(e) => handleFileUpload('lettre_motivation', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => lettreMotivationInputRef.current?.click()}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {lettreMotivationFile ? lettreMotivationFile.name : 'Sélectionner une lettre'}
                  </Button>
                  {lettreMotivationFile && <FileCheck className="text-green-500" />}
                  {!lettreMotivationFile && <FileX className="text-red-500" />}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="write">
            <div className="space-y-4">
              <div>
                <Label htmlFor="lettre_motivation_text">Lettre de motivation</Label>
                <Textarea
                  id="lettre_motivation_text"
                  placeholder="Rédigez votre lettre de motivation..."
                  value={lettreMotivationText}
                  onChange={(e) => setLettreMotivationText(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!cvFile && !lettreMotivationFile && !lettreMotivationText}
          >
            Soumettre ma candidature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostulerModal;
