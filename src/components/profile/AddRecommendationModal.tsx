import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Star, 
  Plus, 
  Trash2, 
  Briefcase, 
  Building2, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle2,
  Trophy,
  Wrench,
  Quote
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TagSelector } from "@/components/ui/tag-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SKILLS_OPTIONS, EDUCATION_LEVEL_OPTIONS } from '../registration/registrationOptions';

interface Recommendation {
  id?: string;
  entreprise_id: string;
  stagiaire_id: string;
  position: string;
  department: string;
  period: string;
  start_date: string;
  end_date: string;
  rating: number;
  content: string;
  skills: string[];
  achievements: string[];
  is_public: boolean;
}

interface AddRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Recommendation, "id">) => void;
  initialData?: Recommendation | null;
  stagiaire: { id: string; name?: string };
  company?: { id: string; name: string; logo?: string };
}

export function AddRecommendationModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  stagiaire,
  company
}: AddRecommendationModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 2;
  const currentDate = new Date().toISOString().split("T")[0];
  
  const [formData, setFormData] = useState<Omit<Recommendation, "id">>({
    entreprise_id: company?.id || "",
    stagiaire_id: stagiaire.id,
    position: initialData?.position || "",
    department: initialData?.department || "",
    period: initialData?.period || "",
    start_date: initialData?.start_date || currentDate,
    end_date: initialData?.end_date || currentDate,
    rating: initialData?.rating || 5,
    content: initialData?.content || "",
    skills: initialData?.skills || [],
    achievements: initialData?.achievements || [""],
    is_public: initialData?.is_public !== undefined ? initialData.is_public : true,
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleAddAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, ""],
    }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    const updatedAchievements = [...formData.achievements];
    updatedAchievements[index] = value;
    setFormData(prev => ({ ...prev, achievements: updatedAchievements }));
  };

  const handleRemoveAchievement = (index: number) => {
    const updatedAchievements = formData.achievements.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, achievements: updatedAchievements }));
  };

  const handleFormSubmit = async () => {
    setLoading(true);
    
    const filteredData = {
      ...formData,
      skills: formData.skills,
      achievements: formData.achievements.filter(a => a.trim() !== ""),
    };

    try {
      const { error } = await supabase
        .from('recommendations')
        .insert(filteredData);

      if (error) throw error;

      toast.success("Recommandation ajoutée avec succès !");
      onSubmit(filteredData);
      onClose();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const renderStars = () => {
    return (
      <div className="flex items-center gap-2 bg-muted/30 p-4 rounded-xl border border-dashed border-primary/20 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className="focus:outline-none transition-transform hover:scale-125 active:scale-90 group"
          >
            <Star
              className={cn(
                "w-10 h-10 transition-colors",
                star <= formData.rating
                  ? "text-amber-400 fill-amber-400 group-hover:text-amber-300"
                  : "text-muted-foreground/30 hover:text-amber-200"
              )}
            />
          </button>
        ))}
        <span className="ml-2 font-bold text-xl text-primary">{formData.rating}/5</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden outline-none">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="text-xs font-semibold bg-primary/5 text-primary border-primary/20">
              RECOMMANDATION • ÉTAPE {step}/{totalSteps}
            </Badge>
            <div className="flex gap-1.5">
              {[1, 2].map((i) => (
                <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-muted")} />
              ))}
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {step === 1 && <><CheckCircle2 className="h-6 w-6 text-primary" /> Contexte du stage</>}
            {step === 2 && <><Trophy className="h-6 w-6 text-primary" /> Évaluation & Feedback</>}
          </DialogTitle>
          <DialogDescription>
             Pour <strong>{stagiaire.name}</strong> • Entreprise : {company?.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {/* STEP 1: CONTEXT */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position" className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Poste occupé</Label>
                    <Input id="position" name="position" value={formData.position} onChange={handleInputChange} placeholder="Ex: Développeur Front-end" className="h-11 rounded-xl shadow-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Département</Label>
                    <Input id="department" name="department" value={formData.department} onChange={handleInputChange} placeholder="Ex: IT / Développement" className="h-11 rounded-xl shadow-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Date de début</Label>
                    <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleInputChange} className="h-11 rounded-xl shadow-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Date de fin</Label>
                    <Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleInputChange} className="h-11 rounded-xl shadow-sm" required />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <TagSelector
                    label={<div className="flex items-center gap-2 mb-2 text-sm font-semibold text-primary"><Wrench className="h-4 w-4" /> Compétences démontrées</div>}
                    placeholder="React, Autonomie, Rigueur..."
                    options={SKILLS_OPTIONS}
                    selected={formData.skills}
                    onChange={(vals) => setFormData(prev => ({ ...prev, skills: vals }))}
                    colorScheme="primary"
                    allowCustom={true}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: FEEDBACK */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <Label>Évaluation globale</Label>
                  {renderStars()}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="content" className="flex items-center gap-2"><Quote className="h-4 w-4 text-primary" /> Votre témoignage</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Qu'est-ce qui a rendu le passage de ce stagiaire remarquable ?"
                    className="rounded-xl shadow-sm resize-none border-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Réalisations notables</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddAchievement} className="h-7 text-xs rounded-full bg-primary/5 border-primary/20 text-primary">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                        <Input
                          value={achievement}
                          onChange={(e) => handleAchievementChange(index, e.target.value)}
                          placeholder="Ex: A optimisé les temps de chargement de 30%..."
                          className="h-10 rounded-xl"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAchievement(index)} disabled={formData.achievements.length <= 1} className="text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
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
              <Button onClick={handleFormSubmit} className="px-8 bg-primary shadow-lg transition-all active:scale-95" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Enregistrer
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
