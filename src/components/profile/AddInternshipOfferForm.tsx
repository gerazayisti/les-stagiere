import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Database } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { 
  CalendarIcon, 
  Sparkles, 
  Eye, 
  Edit, 
  Wand2, 
  ChevronRight, 
  ChevronLeft, 
  Save,
  MapPin,
  Coins,
  GraduationCap,
  Wrench,
  Info,
  Briefcase
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { extractSkillsFromText, deduceEducationLevelFromText, estimateCompensationAmount } from '@/lib/aiHelpers';
import FormattedText from "@/components/FormattedText";
import { useSessionTimeout } from "@/contexts/SessionTimeoutContext";
import AIStageGenerator from "@/components/AIStageGenerator";
import { TagSelector } from "@/components/ui/tag-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SKILLS_OPTIONS, EDUCATION_LEVEL_OPTIONS } from '../registration/registrationOptions';

type StageType = 'temps_plein' | 'temps_partiel' | 'alternance' | 'remote';
type StageStatus = 'draft' | 'active' | 'expired';
type Stage = Database['public']['Tables']['stages']['Row'];

interface AddInternshipOfferFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Stage) => void;
  initialData?: Stage;
}

function SectionLabel({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-semibold">
      <Icon className="h-4 w-4 text-primary" />
      {text}
    </span>
  );
}

export default function AddInternshipOfferForm({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddInternshipOfferFormProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);
  const { resetTimer } = useSessionTimeout();

  // Form State
  const [description, setDescription] = useState(initialData?.description || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [type, setType] = useState<StageType>(initialData?.type as StageType || "temps_plein");
  const [educationLevel, setEducationLevel] = useState(initialData?.education_level || "");
  const [compensationAmount, setCompensationAmount] = useState(0); // Compensation parsing from JSONB
  const [compensationCurrency, setCompensationCurrency] = useState("XAF");
  
  const [requiredSkills, setRequiredSkills] = useState<string[]>(initialData?.required_skills || []);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(initialData?.preferred_skills || []);
  
  const [startDate, setStartDate] = useState<Date | undefined>(initialData?.start_date ? new Date(initialData.start_date) : new Date());
  const [deadline, setDeadline] = useState<Date | undefined>(initialData?.deadline ? new Date(initialData.deadline) : undefined);
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false);
  const [isUrgent, setIsUrgent] = useState(initialData?.is_urgent || false);

  // States for IA
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [previewAI, setPreviewAI] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      resetTimer();
    }
  }, [isOpen]);

  const handleGenerateSuggestions = async () => {
    if (!description.trim()) {
      toast.error("Veuillez d'abord saisir une description !");
      return;
    }

    setLoading(true);
    toast.loading("L'IA analyse votre offre...", { id: "ai-analyze" });
    
    try {
      const skills = await extractSkillsFromText(description);
      const eduLevel = await deduceEducationLevelFromText(description);
      const estimatedComp = await estimateCompensationAmount(type, location);

      setRequiredSkills(skills);
      setEducationLevel(eduLevel);
      if (!compensationAmount) setCompensationAmount(estimatedComp);
      if (!title) {
         const firstLine = description.split('\n')[0].trim();
         setTitle(firstLine.slice(0, 100));
      }

      toast.success("Suggestions générées !", { id: "ai-analyze" });
      setStep(2); // Auto-advance to details
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Erreur d'analyse IA", { id: "ai-analyze" });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratedContent = (content: string) => {
    setDescription(content);
    setShowAIGenerator(false);
    toast.success("Description améliorée !");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      const compensation = JSON.stringify({
        amount: compensationAmount,
        currency: compensationCurrency,
        period: 'mois'
      });

      const stageData = {
        entreprise_id: user.id,
        title: title || description.split('\n')[0].trim().slice(0, 100),
        description,
        short_description: description.slice(0, 250),
        location: location || "Remote",
        remote_policy: type === 'remote' ? 'Télétravail' : 'Présentiel',
        type,
        start_date: startDate?.toISOString(),
        deadline: deadline?.toISOString(),
        compensation,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
        education_level: educationLevel,
        status: 'active',
        is_featured: isFeatured,
        is_urgent: isUrgent,
      };

      const { data, error } = await supabase.from('stages').insert(stageData).select();
      if (error) throw error;

      toast.success("Offre publiée avec succès !");
      onSave(data[0]);
      onClose();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] gap-0 p-0 overflow-hidden outline-none">
        
        <AIStageGenerator 
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onGenerated={(content) => handleGeneratedContent(content)}
          contentType="description"
          initialPrompt={description}
        />

        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="text-xs font-semibold bg-primary/5 text-primary border-primary/20">
              NOUVELLE OFFRE • ÉTAPE {step}/{totalSteps}
            </Badge>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-muted")} />
              ))}
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {step === 1 && <><Info className="h-6 w-6 text-primary" /> Description du poste</>}
            {step === 2 && <><Briefcase className="h-6 w-6 text-primary" /> Détails du stage</>}
            {step === 3 && <><Wrench className="h-6 w-6 text-primary" /> Profil recherché</>}
            {step === 4 && <><Coins className="h-6 w-6 text-primary" /> Logistique & Budget</>}
          </DialogTitle>
          <DialogDescription>
             {step === 1 && "Décrivez le stage, l'IA s'occupera d'extraire les détails techniques."}
             {step === 2 && "Précisez le titre et le format de travail de ce stage."}
             {step === 3 && "Sélectionnez les compétences clés que vous recherchez."}
             {step === 4 && "Dates, lieu et rémunération proposée."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="p-6 space-y-6">
            {/* STEP 1: DESCRIPTION */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Contenu de l'offre</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-primary bg-primary/5 border-primary/20 hover:bg-primary/10" onClick={() => setShowAIGenerator(true)}>
                      <Sparkles className="h-3.5 w-3.5" /> IA : Améliorer
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setPreviewAI(!previewAI)}>
                      {previewAI ? <><Edit className="h-3.5 w-3.5" /> Édition</> : <><Eye className="h-3.5 w-3.5" /> Aperçu</>}
                    </Button>
                  </div>
                </div>
                {previewAI ? (
                  <div className="min-h-[250px] p-4 border rounded-xl bg-muted/20 prose prose-sm max-w-none">
                    <FormattedText text={description || "*Aucun contenu pour le moment...*"} highlightKeywords={true} />
                  </div>
                ) : (
                  <Textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Saisissez la description complète. Plus c'est détaillé, plus l'IA sera précise !"
                    className="min-h-[250px] shadow-sm resize-none rounded-xl"
                  />
                )}
                <div className="flex justify-center pt-2">
                   <Button onClick={handleGenerateSuggestions} variant="secondary" className="gap-2 shadow-sm border" disabled={!description || loading}>
                      <Wand2 className={cn("h-4 w-4", loading && "animate-spin")} />
                      {loading ? "Analyse en cours..." : "Lancer l'analyse IA des données"}
                   </Button>
                </div>
              </div>
            )}

            {/* STEP 2: STAGE DETAILS */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label>Titre de l'offre</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Stage Développeur Fullstack" className="h-11 rounded-xl shadow-sm" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type de contrat</Label>
                    <Select value={type} onValueChange={(v: StageType) => setType(v)}>
                      <SelectTrigger className="h-11 rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temps_plein">Temps plein</SelectItem>
                        <SelectItem value="temps_partiel">Temps partiel</SelectItem>
                        <SelectItem value="alternance">Alternance</SelectItem>
                        <SelectItem value="remote">Remote complet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Niveau d'études requis</Label>
                    <Input value={educationLevel} onChange={e => setEducationLevel(e.target.value)} placeholder="Ex: Bac +3 / Licence" className="h-11 rounded-xl shadow-sm" />
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-xl bg-orange-50/50 border-orange-100">
                   <div className="bg-orange-100 p-2 rounded-full h-fit mt-0.5"><Sparkles className="h-4 w-4 text-orange-600" /></div>
                   <div className="text-sm">
                      <p className="font-semibold text-orange-900">Conseil IA</p>
                      <p className="text-orange-800/80">Nous avons extrait ces informations de votre description. N'hésitez pas à les ajuster si nécessaire.</p>
                   </div>
                </div>
              </div>
            )}

            {/* STEP 3: SKILLS */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <TagSelector
                  label={<SectionLabel icon={Wrench} text="Compétences indispensables" />}
                  placeholder="Python, SQL, Anglais..."
                  options={SKILLS_OPTIONS}
                  selected={requiredSkills}
                  onChange={setRequiredSkills}
                  colorScheme="primary"
                />
                <TagSelector
                  label={<SectionLabel icon={Sparkles} text="Compétences appréciées (Bonus)" />}
                  placeholder="Docker, Figma, Soft Skills..."
                  options={SKILLS_OPTIONS}
                  selected={preferredSkills}
                  onChange={setPreferredSkills}
                  colorScheme="primary"
                />
              </div>
            )}

            {/* STEP 4: LOGISTICS */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Lieu</Label>
                    <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ville, Pays" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Coins className="h-4 w-4" /> Rémunération (mois)</Label>
                    <div className="relative">
                      <Input type="number" value={compensationAmount} onChange={e => setCompensationAmount(Number(e.target.value))} className="h-11 pr-16 rounded-xl" />
                      <span className="absolute right-3 top-2.5 text-muted-foreground font-medium">{compensationCurrency}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 flex flex-col">
                    <Label>Date de début</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("h-11 text-left font-normal rounded-xl", !startDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Choisir...</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} /></PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label>Date limite d'envoi</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("h-11 text-left font-normal rounded-xl", !deadline && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deadline ? format(deadline, "PPP") : <span>Choisir...</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={deadline} onSelect={setDeadline} /></PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center space-x-2 border p-3 rounded-xl bg-muted/30">
                     <Checkbox id="urgent" checked={isUrgent} onCheckedChange={(v) => setIsUrgent(v === true)} />
                     <Label htmlFor="urgent" className="text-sm font-medium cursor-pointer">Marquer comme Urgent</Label>
                   </div>
                   <div className="flex items-center space-x-2 border p-3 rounded-xl bg-muted/30">
                     <Checkbox id="featured" checked={isFeatured} onCheckedChange={(v) => setIsFeatured(v === true)} />
                     <Label htmlFor="featured" className="text-sm font-medium cursor-pointer">Offre à la une</Label>
                   </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 border-t bg-muted/5 flex flex-row sm:justify-between items-center gap-2">
          <div>
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={onClose}>
                Annuler
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < totalSteps ? (
              <Button onClick={nextStep} className="px-8 shadow-sm transition-all active:scale-95">
                Suivant <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="px-8 bg-primary shadow-lg transition-all active:scale-95" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Publier l'offre
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
