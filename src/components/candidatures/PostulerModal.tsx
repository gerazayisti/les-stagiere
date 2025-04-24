import React, { useState, useRef, useEffect } from 'react';
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
  FileX,
  Check,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useCandidatures } from '@/hooks/useCandidatures';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";

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
  
  // États pour les documents existants
  const [existingCV, setExistingCV] = useState<{id: string, file_url: string, name?: string} | null>(null);
  const [existingLM, setExistingLM] = useState<{id: string, file_url: string, name?: string} | null>(null);
  const [useExistingCV, setUseExistingCV] = useState(false);
  const [useExistingLM, setUseExistingLM] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer les documents existants du profil
  useEffect(() => {
    if (open && user) {
      fetchExistingDocuments();
    }
  }, [open, user]);

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

  const handleFileUpload = (type: 'cv' | 'lettre_motivation', file: File | null) => {
    if (type === 'cv') {
      setCvFile(file);
      setUseExistingCV(false);
    } else {
      setLettreMotivationFile(file);
      setUseExistingLM(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour postuler');
      return;
    }

    setIsSubmitting(true);
    try {
      // Préparer les documents à envoyer
      const cvToSend = useExistingCV && existingCV ? existingCV.id : cvFile;
      const lmToSend = useExistingLM && existingLM ? existingLM.id : (lettreMotivationFile || lettreMotivationText);

      await createCandidature({
        stage_id: stageId,
        stagiaire_id: user.id,
        cv: cvToSend,
        lettre_motivation: lmToSend,
        status: 'en_attente',
        use_existing_documents: useExistingCV || useExistingLM
      });

      toast.success('Votre candidature a été soumise avec succès');
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la candidature:", error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la soumission de la candidature');
    } finally {
      setIsSubmitting(false);
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
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="cv">CV</Label>
                  {existingCV && (
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="use-existing-cv" 
                        checked={useExistingCV}
                        onCheckedChange={(checked) => {
                          setUseExistingCV(checked === true);
                          if (checked) setCvFile(null);
                        }}
                        disabled={loadingDocs || isSubmitting}
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
                      disabled={isSubmitting}
                    >
                      <RefreshCw size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="cv"
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      ref={cvInputRef}
                      onChange={(e) => handleFileUpload('cv', e.target.files?.[0] || null)}
                      className="hidden"
                      disabled={loadingDocs || isSubmitting}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => cvInputRef.current?.click()}
                      disabled={loadingDocs || isSubmitting}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {cvFile ? cvFile.name : 'Sélectionner un CV'}
                    </Button>
                    {cvFile && <FileCheck className="text-green-500" />}
                    {!cvFile && !useExistingCV && <FileX className="text-red-500" />}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="lettre_motivation">Lettre de motivation</Label>
                  {existingLM && (
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="use-existing-lm" 
                        checked={useExistingLM}
                        onCheckedChange={(checked) => {
                          setUseExistingLM(checked === true);
                          if (checked) {
                            setLettreMotivationFile(null);
                            setLettreMotivationText('');
                          }
                        }}
                        disabled={loadingDocs || isSubmitting}
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
                      disabled={isSubmitting}
                    >
                      <RefreshCw size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="lettre_motivation"
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      ref={lettreMotivationInputRef}
                      onChange={(e) => handleFileUpload('lettre_motivation', e.target.files?.[0] || null)}
                      className="hidden"
                      disabled={loadingDocs || isSubmitting}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => lettreMotivationInputRef.current?.click()}
                      disabled={loadingDocs || isSubmitting}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {lettreMotivationFile ? lettreMotivationFile.name : 'Sélectionner une lettre'}
                    </Button>
                    {lettreMotivationFile && <FileCheck className="text-green-500" />}
                    {!lettreMotivationFile && !useExistingLM && <FileX className="text-red-500" />}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="write">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="lettre_motivation_text">Lettre de motivation</Label>
                  {existingLM && (
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="use-existing-lm-text" 
                        checked={useExistingLM}
                        onCheckedChange={(checked) => {
                          setUseExistingLM(checked === true);
                          if (checked) {
                            setLettreMotivationFile(null);
                            setLettreMotivationText('');
                          }
                        }}
                        disabled={loadingDocs || isSubmitting}
                      />
                      <Label htmlFor="use-existing-lm-text" className="text-sm cursor-pointer">
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
                      disabled={isSubmitting}
                    >
                      <RefreshCw size={14} />
                    </Button>
                  </div>
                ) : (
                  <Textarea
                    id="lettre_motivation_text"
                    placeholder="Rédigez votre lettre de motivation..."
                    value={lettreMotivationText}
                    onChange={(e) => {
                      setLettreMotivationText(e.target.value);
                      setUseExistingLM(false);
                    }}
                    className="min-h-[200px]"
                    disabled={loadingDocs || isSubmitting}
                  />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loadingDocs || isSubmitting || 
              (!cvFile && !useExistingCV) || 
              (!lettreMotivationFile && !lettreMotivationText && !useExistingLM)}
          >
            {loadingDocs && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            )}
            {isSubmitting && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Soumission...
              </>
            )}
            {!loadingDocs && !isSubmitting && "Soumettre ma candidature"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostulerModal;
