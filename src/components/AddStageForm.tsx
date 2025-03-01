
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface StageFormData {
  title: string;
  description: string;
  short_description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  remote_policy: string;
  type: "temps_plein" | "temps_partiel" | "alternance" | "remote";
  duration: string;
  start_date: string;
  compensation: {
    amount: number;
    currency: string;
    period: string;
  };
  required_skills: string[];
  preferred_skills: string[];
  education_level: string;
  deadline: string;
  is_featured: boolean;
  is_urgent: boolean;
}

interface AddStageFormProps {
  isOpen: boolean;
  onClose: () => void;
  entrepriseId: string;
  onSuccess?: () => void;
}

export function AddStageForm({ isOpen, onClose, entrepriseId, onSuccess }: AddStageFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StageFormData>({
    title: "",
    description: "",
    short_description: "",
    requirements: "",
    responsibilities: "",
    location: "",
    remote_policy: "non",
    type: "temps_plein",
    duration: "",
    start_date: "",
    compensation: {
      amount: 0,
      currency: "EUR",
      period: "mensuel",
    },
    required_skills: [""],
    preferred_skills: [""],
    education_level: "",
    deadline: "",
    is_featured: false,
    is_urgent: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith("compensation.")) {
      const compensationField = name.split(".")[1];
      setFormData({
        ...formData,
        compensation: {
          ...formData.compensation,
          [compensationField]: type === "number" ? parseFloat(value) : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" 
          ? (e.target as HTMLInputElement).checked 
          : value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSkillChange = (index: number, value: string, type: 'required' | 'preferred') => {
    const skillsField = type === 'required' ? 'required_skills' : 'preferred_skills';
    const updatedSkills = [...formData[skillsField]];
    updatedSkills[index] = value;
    setFormData({
      ...formData,
      [skillsField]: updatedSkills,
    });
  };

  const addSkill = (type: 'required' | 'preferred') => {
    const skillsField = type === 'required' ? 'required_skills' : 'preferred_skills';
    setFormData({
      ...formData,
      [skillsField]: [...formData[skillsField], ""],
    });
  };

  const removeSkill = (index: number, type: 'required' | 'preferred') => {
    const skillsField = type === 'required' ? 'required_skills' : 'preferred_skills';
    if (formData[skillsField].length > 1) {
      const updatedSkills = [...formData[skillsField]];
      updatedSkills.splice(index, 1);
      setFormData({
        ...formData,
        [skillsField]: updatedSkills,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for insertion
      const stageData = {
        entreprise_id: entrepriseId,
        title: formData.title,
        description: formData.description,
        short_description: formData.short_description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        location: formData.location,
        remote_policy: formData.remote_policy,
        type: formData.type,
        duration: formData.duration,
        start_date: formData.start_date,
        compensation: formData.compensation,
        required_skills: formData.required_skills.filter(skill => skill.trim() !== ""),
        preferred_skills: formData.preferred_skills.filter(skill => skill.trim() !== ""),
        education_level: formData.education_level,
        deadline: formData.deadline,
        is_featured: formData.is_featured,
        is_urgent: formData.is_urgent,
        status: "active",
        created_at: new Date().toISOString(),
      };
      
      // Insert into the database
      const { data, error } = await supabase
        .from('stages')
        .insert(stageData)
        .select('id')
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success("Offre de stage créée avec succès");
      
      // Reset form and close
      setFormData({
        title: "",
        description: "",
        short_description: "",
        requirements: "",
        responsibilities: "",
        location: "",
        remote_policy: "non",
        type: "temps_plein",
        duration: "",
        start_date: "",
        compensation: {
          amount: 0,
          currency: "EUR",
          period: "mensuel",
        },
        required_skills: [""],
        preferred_skills: [""],
        education_level: "",
        deadline: "",
        is_featured: false,
        is_urgent: false,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la création du stage:", error);
      toast.error("Erreur lors de la création de l'offre de stage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une offre de stage</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            {/* Informations de base */}
            <div>
              <Label htmlFor="title">Titre de l'offre *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Développeur Front-end React"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="short_description">Résumé court *</Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  placeholder="Décrivez brièvement ce stage en quelques phrases..."
                  className="h-24"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description complète *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez en détail ce stage..."
                  className="h-24"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requirements">Prérequis</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="Quels sont les prérequis pour ce stage?"
                  className="h-24"
                />
              </div>
              
              <div>
                <Label htmlFor="responsibilities">Responsabilités</Label>
                <Textarea
                  id="responsibilities"
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleInputChange}
                  placeholder="Quelles seront les responsabilités du stagiaire?"
                  className="h-24"
                />
              </div>
            </div>
            
            {/* Localisation et type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="location">Localisation *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ex: Paris, France"
                  required
                />
              </div>
              
              <div>
                <Label>Type de stage *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temps_plein">Temps plein</SelectItem>
                    <SelectItem value="temps_partiel">Temps partiel</SelectItem>
                    <SelectItem value="alternance">Alternance</SelectItem>
                    <SelectItem value="remote">Télétravail complet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Politique de télétravail</Label>
                <Select 
                  value={formData.remote_policy} 
                  onValueChange={(value) => handleSelectChange("remote_policy", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une politique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non">Pas de télétravail</SelectItem>
                    <SelectItem value="hybride">Hybride</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                    <SelectItem value="complet">Télétravail complet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Durée et dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration">Durée *</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="Ex: 6 mois"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="start_date">Date de début *</Label>
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
                <Label htmlFor="deadline">Date limite de candidature</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {/* Rémunération */}
            <div className="space-y-2">
              <Label>Rémunération</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="compensation.amount">Montant</Label>
                  <Input
                    id="compensation.amount"
                    name="compensation.amount"
                    type="number"
                    value={formData.compensation.amount}
                    onChange={handleInputChange}
                    placeholder="Ex: 800"
                  />
                </div>
                
                <div>
                  <Label>Devise</Label>
                  <Select 
                    value={formData.compensation.currency} 
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        compensation: {
                          ...formData.compensation,
                          currency: value
                        }
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Période</Label>
                  <Select 
                    value={formData.compensation.period} 
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        compensation: {
                          ...formData.compensation,
                          period: value
                        }
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horaire">Par heure</SelectItem>
                      <SelectItem value="journalier">Par jour</SelectItem>
                      <SelectItem value="hebdomadaire">Par semaine</SelectItem>
                      <SelectItem value="mensuel">Par mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Compétences requises */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Compétences requises</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSkill('required')}
                >
                  Ajouter une compétence
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.required_skills.map((skill, index) => (
                  <div key={`req-skill-${index}`} className="flex items-center gap-2">
                    <Input
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value, 'required')}
                      placeholder="Ex: React, Node.js, UI/UX..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeSkill(index, 'required')}
                      disabled={formData.required_skills.length <= 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Compétences souhaitées */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Compétences souhaitées</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSkill('preferred')}
                >
                  Ajouter une compétence
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.preferred_skills.map((skill, index) => (
                  <div key={`pref-skill-${index}`} className="flex items-center gap-2">
                    <Input
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value, 'preferred')}
                      placeholder="Ex: TypeScript, Docker, AWS..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeSkill(index, 'preferred')}
                      disabled={formData.preferred_skills.length <= 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Niveau d'études */}
            <div>
              <Label htmlFor="education_level">Niveau d'études souhaité</Label>
              <Input
                id="education_level"
                name="education_level"
                value={formData.education_level}
                onChange={handleInputChange}
                placeholder="Ex: Bac+3, Master, Formation développeur web..."
              />
            </div>
            
            {/* Options supplémentaires */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_featured" className="font-normal">
                  Offre mise en avant
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_urgent"
                  name="is_urgent"
                  checked={formData.is_urgent}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_urgent" className="font-normal">
                  Recrutement urgent
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer l'offre"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
