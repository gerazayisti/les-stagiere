import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";

export interface Recommendation {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  stagiaireId: string;
  stagiaireName: string;
  position: string;
  period: string;
  rating: number;
  skills: string[];
  content: string;
  date: string;
}

interface AddRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (recommendation: Omit<Recommendation, "id" | "companyId" | "companyName" | "companyLogo" | "date">) => void;
  stagiaires: Array<{
    id: string;
    name: string;
  }>;
}

const SKILLS = [
  "Travail d'équipe",
  "Communication",
  "Résolution de problèmes",
  "Autonomie",
  "Adaptabilité",
  "Leadership",
  "Créativité",
  "Organisation",
  "Gestion du temps",
  "Esprit analytique",
  "Initiative",
  "Rigueur",
  "Capacité d'apprentissage",
  "Professionnalisme",
];

export function AddRecommendationModal({
  isOpen,
  onClose,
  onSubmit,
  stagiaires,
}: AddRecommendationModalProps) {
  const [rating, setRating] = useState(5);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [selectedStagiaire, setSelectedStagiaire] = useState("");
  const [position, setPosition] = useState("");
  const [period, setPeriod] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedStagiaire || !content || !position || !period) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const stagiaire = stagiaires.find(s => s.id === selectedStagiaire);
    if (!stagiaire) return;

    const recommendation = {
      stagiaireId: selectedStagiaire,
      stagiaireName: stagiaire.name,
      position,
      period,
      rating,
      skills: selectedSkills,
      content,
    };

    onSubmit(recommendation);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setRating(5);
    setSelectedSkills([]);
    setContent("");
    setSelectedStagiaire("");
    setPosition("");
    setPeriod("");
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une recommandation</DialogTitle>
          <DialogDescription>
            Partagez votre expérience avec ce stagiaire
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label>Stagiaire *</Label>
              <Select
                value={selectedStagiaire}
                onValueChange={setSelectedStagiaire}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un stagiaire" />
                </SelectTrigger>
                <SelectContent>
                  {stagiaires.map((stagiaire) => (
                    <SelectItem key={stagiaire.id} value={stagiaire.id}>
                      {stagiaire.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="position">Poste occupé *</Label>
              <Select
                value={position}
                onValueChange={setPosition}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le poste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stage_dev">Stagiaire Développeur</SelectItem>
                  <SelectItem value="stage_data">Stagiaire Data Analyst</SelectItem>
                  <SelectItem value="stage_design">Stagiaire Designer</SelectItem>
                  <SelectItem value="stage_marketing">Stagiaire Marketing</SelectItem>
                  <SelectItem value="stage_business">Stagiaire Business</SelectItem>
                  <SelectItem value="stage_other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="period">Période du stage *</Label>
              <Select
                value={period}
                onValueChange={setPeriod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_month">1 mois</SelectItem>
                  <SelectItem value="2_months">2 mois</SelectItem>
                  <SelectItem value="3_months">3 mois</SelectItem>
                  <SelectItem value="4_months">4 mois</SelectItem>
                  <SelectItem value="5_months">5 mois</SelectItem>
                  <SelectItem value="6_months">6 mois</SelectItem>
                  <SelectItem value="more_6_months">Plus de 6 mois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Note globale</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Compétences démontrées</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SKILLS.map((skill) => (
                  <Button
                    key={skill}
                    type="button"
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    onClick={() => handleSkillToggle(skill)}
                    className="text-sm"
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="content">Recommandation *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Partagez votre expérience avec ce stagiaire, ses réalisations, et pourquoi vous le recommandez..."
                className="h-32"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
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
