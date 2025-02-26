import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";

interface RecommendationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecommendationData) => void;
  candidat: {
    id: string;
    name: string;
  };
}

export interface RecommendationData {
  candidatId: string;
  position: string;
  period: string;
  rating: number;
  skills: string[];
  content: string;
}

export function RecommendationForm({
  isOpen,
  onClose,
  onSubmit,
  candidat,
}: RecommendationFormProps) {
  const [formData, setFormData] = useState<RecommendationData>({
    candidatId: candidat.id,
    position: "",
    period: "",
    rating: 5,
    skills: [],
    content: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const positions = [
    { value: "stage_dev", label: "Stagiaire Développeur" },
    { value: "stage_data", label: "Stagiaire Data Analyst" },
    { value: "stage_design", label: "Stagiaire Designer" },
    { value: "stage_marketing", label: "Stagiaire Marketing" },
    { value: "stage_business", label: "Stagiaire Business" },
    { value: "stage_other", label: "Autre" },
  ];

  const periods = [
    { value: "1_month", label: "1 mois" },
    { value: "2_months", label: "2 mois" },
    { value: "3_months", label: "3 mois" },
    { value: "4_months", label: "4 mois" },
    { value: "5_months", label: "5 mois" },
    { value: "6_months", label: "6 mois" },
    { value: "more_6_months", label: "Plus de 6 mois" },
  ];

  const commonSkills = [
    "React",
    "Node.js",
    "TypeScript",
    "Python",
    "Java",
    "UI/UX",
    "Communication",
    "Travail d'équipe",
    "Autonomie",
    "Créativité",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle>Recommander {candidat.name}</DialogTitle>
          <DialogDescription>
            Partagez votre expérience avec ce stagiaire pour aider d'autres entreprises.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Poste occupé</label>
              <Select
                value={formData.position}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, position: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un poste" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>
                      {pos.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Durée du stage</label>
              <Select
                value={formData.period}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, period: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une durée" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Note globale</label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, rating: star }))
                    }
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= formData.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Compétences démontrées</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonSkills.map((skill) => (
                  <Button
                    key={skill}
                    type="button"
                    variant={
                      formData.skills.includes(skill) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        skills: prev.skills.includes(skill)
                          ? prev.skills.filter((s) => s !== skill)
                          : [...prev.skills, skill],
                      }))
                    }
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                Contenu de la recommandation
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Décrivez votre expérience avec ce stagiaire..."
                className="mt-2"
                rows={5}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 sticky bottom-0 bg-background pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Publier la recommandation</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
