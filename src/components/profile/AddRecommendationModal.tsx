
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Plus, Trash2, Briefcase, Building2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
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
    skills: initialData?.skills || [""],
    achievements: initialData?.achievements || [""],
    is_public: initialData?.is_public !== undefined ? initialData.is_public : true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleRatingChange = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  const handleAddSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, ""],
    });
  };

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = value;
    setFormData({ ...formData, skills: updatedSkills });
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: updatedSkills });
  };

  const handleAddAchievement = () => {
    setFormData({
      ...formData,
      achievements: [...formData.achievements, ""],
    });
  };

  const handleAchievementChange = (index: number, value: string) => {
    const updatedAchievements = [...formData.achievements];
    updatedAchievements[index] = value;
    setFormData({ ...formData, achievements: updatedAchievements });
  };

  const handleRemoveAchievement = (index: number) => {
    const updatedAchievements = formData.achievements.filter((_, i) => i !== index);
    setFormData({ ...formData, achievements: updatedAchievements });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Filter out empty skills and achievements
    const filteredData = {
      ...formData,
      skills: formData.skills.filter(s => s.trim() !== ""),
      achievements: formData.achievements.filter(a => a.trim() !== ""),
    };

    try {
      // Enregistrer dans la BD
      const { data, error } = await supabase
        .from('recommendations')
        .insert(filteredData)
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: "Recommandation ajoutée",
        description: "Votre recommandation a été ajoutée avec succès.",
      });

      onSubmit({ ...filteredData, id: data.id });
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la recommandation:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la recommandation. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                star <= formData.rating
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Modifier la recommandation" : "Ajouter une recommandation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="position">Poste occupé</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Ex: Développeur Front-end"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="department">Département</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Ex: Technologies de l'information"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="period">Période</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="period"
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Ex: Janvier - Juin 2023"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Date de début</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Date de fin</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Évaluation</Label>
            {renderStars()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Témoignage</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={4}
              placeholder="Décrivez votre expérience avec ce stagiaire, ses forces, sa contribution, etc."
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Compétences démontrées</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSkill}
              >
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder="Ex: React, Communication, Travail d'équipe..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSkill(index)}
                    disabled={formData.skills.length <= 1}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Réalisations notables</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAchievement}
              >
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {formData.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={achievement}
                    onChange={(e) =>
                      handleAchievementChange(index, e.target.value)
                    }
                    placeholder="Ex: A développé une fonctionnalité qui a amélioré..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAchievement(index)}
                    disabled={formData.achievements.length <= 1}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              checked={formData.is_public}
              onChange={(e) =>
                setFormData({ ...formData, is_public: e.target.checked })
              }
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="is_public" className="text-sm font-normal">
              Rendre cette recommandation publique
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button type="submit">
              {initialData ? "Mettre à jour" : "Ajouter la recommandation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
