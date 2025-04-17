import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { toast } from "sonner";
import { Database } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ListSkills } from '../ListSkills';
import { extractSkillsFromText, deduceEducationLevelFromText, estimateCompensationAmount } from '@/lib/aiHelpers';

type StageType = 'temps_plein' | 'temps_partiel' | 'alternance' | 'remote';
type StageStatus = 'draft' | 'active' | 'expired';

type Stage = Database['public']['Tables']['stages']['Row'];

interface AddInternshipOfferFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Stage) => void;
  initialData?: Stage;
}

export default function AddInternshipOfferForm({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddInternshipOfferFormProps) {
  const [description, setDescription] = useState(initialData?.description || "");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [startDate] = useState<Date>(new Date());
  const [requiredSkills, setRequiredSkills] = useState<[string, ...string[]]>([""]);
  const [preferredSkills, setPreferredSkills] = useState<[string, ...string[]]>([""]);
  const [educationLevel, setEducationLevel] = useState("");
  const [compensationAmount, setCompensationAmount] = useState(0);
  const [compensationCurrency, setCompensationCurrency] = useState("XAF");
  const [type, setType] = useState<StageType>("temps_plein");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<StageStatus>("active");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [deadline, setDeadline] = useState<Date | null>(null);

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skills = await extractSkillsFromText(description);
      const educationLevel = await deduceEducationLevelFromText(description);
      const compensationAmount = await estimateCompensationAmount(type, location);

      setRequiredSkills(skills as [string, ...string[]]);
      setPreferredSkills(skills as [string, ...string[]]);
      setEducationLevel(educationLevel);
      setCompensationAmount(compensationAmount);
      setShowPreview(true);
    } catch (error) {
      console.error("Erreur lors de la génération des suggestions:", error);
      toast.error("Impossible de générer les suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation des champs obligatoires
    if (!description.trim()) {
      toast.error("La description du stage est obligatoire");
      setLoading(false);
      return;
    }

    if (!location.trim()) {
      toast.error("Le lieu du stage est obligatoire");
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour créer une offre de stage");
        setLoading(false);
        return;
      }

      // Extraction du titre à partir de la première ligne de la description
      const titleFromDescription = description.split('\n')[0].trim();
      // Limiter le titre à 255 caractères maximum
      const limitedTitle = (titleFromDescription || 'Offre de stage sans titre').slice(0, 250);
      
      // Limiter la description courte à 255 caractères
      const shortDescription = description.slice(0, 250);
      
      // Limiter la longueur de l'emplacement
      const limitedLocation = location.slice(0, 250);
      
      // Limiter la politique de travail à distance
      const remotePolicy = (type === 'remote' ? 'Télétravail' : 'Présentiel').slice(0, 250);
      
      // Limiter le niveau d'éducation
      const limitedEducationLevel = (educationLevel || 'Non spécifié').slice(0, 250);

      // Préparer les compétences pour s'assurer qu'elles sont au bon format
      // et limiter chaque compétence à 250 caractères
      const cleanRequiredSkills = requiredSkills
        .filter(skill => skill.trim() !== '')
        .map(skill => skill.trim().slice(0, 250));
        
      const cleanPreferredSkills = preferredSkills
        .filter(skill => skill.trim() !== '')
        .map(skill => skill.trim().slice(0, 250));

      // Préparer l'objet compensation en tant que chaîne JSON
      const compensationObject = {
        amount: compensationAmount || 0,
        currency: compensationCurrency || 'XAF',
        period: 'mois'
      };
      
      // S'assurer que la chaîne JSON ne dépasse pas 255 caractères
      const compensationJson = JSON.stringify(compensationObject);
      const limitedCompensationJson = compensationJson.length > 250 
        ? JSON.stringify({ amount: compensationAmount || 0, currency: 'XAF' })
        : compensationJson;
      
      // Convertir les dates au format ISO
      const formattedStartDate = startDate ? startDate.toISOString() : null;
      const formattedDeadline = deadline ? deadline.toISOString() : null;

      const stageData = {
        entreprise_id: user.id,
        title: limitedTitle,
        description, // La description complète peut être longue, mais vérifiez que la colonne est de type TEXT
        short_description: shortDescription,
        requirements: description, // Vérifiez que cette colonne est de type TEXT
        responsibilities: description, // Vérifiez que cette colonne est de type TEXT
        location: limitedLocation,
        remote_policy: remotePolicy,
        type,
        start_date: formattedStartDate,
        // Stocker la compensation comme une chaîne JSON
        compensation: limitedCompensationJson,
        required_skills: cleanRequiredSkills,
        preferred_skills: cleanPreferredSkills,
        education_level: limitedEducationLevel,
        status: 'active',
        deadline: formattedDeadline,
        is_featured: isFeatured,
        is_urgent: isUrgent,
        views_count: 0,
        applications_count: 0
      };

      console.log("Données à insérer:", stageData);

      const { data, error } = await supabase
        .from('stages')
        .insert(stageData)
        .select();

      if (error) {
        console.error("Erreur lors de l'insertion de l'offre de stage:", error);
        // Afficher plus de détails sur l'erreur
        if (error.details) console.error("Détails de l'erreur:", error.details);
        if (error.hint) console.error("Indice:", error.hint);
        if (error.message) console.error("Message:", error.message);
        
        toast.error(`Impossible de créer l'offre de stage: ${error.message || 'Erreur inconnue'}`);
        return;
      }

      toast.success("Offre de stage créée avec succès");
      onSave(data[0]);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      // Afficher plus de détails sur l'erreur
      if (error instanceof Error) {
        console.error("Message d'erreur:", error.message);
        toast.error(`Une erreur est survenue: ${error.message}`);
      } else {
        toast.error("Une erreur inconnue est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (showPreview) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
        <div className="relative w-full max-w-2xl mx-auto mt-10">
          <Card className="rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Prévisualisation de l'offre de stage</CardTitle>
              <CardDescription>
                Vérifiez et ajustez les champs remplis automatiquement par l'IA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Compétences requises</Label>
                <Input
                  type="text"
                  value={requiredSkills.join(', ')}
                  onChange={(e) => setRequiredSkills(e.target.value.split(', ') as [string, ...string[]])}
                />
              </div>
              <div>
                <Label>Compétences préférées</Label>
                <Input
                  type="text"
                  value={preferredSkills.join(', ')}
                  onChange={(e) => setPreferredSkills(e.target.value.split(', ') as [string, ...string[]])}
                />
              </div>
              <div>
                <Label>Niveau d'éducation</Label>
                <Input
                  type="text"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                />
              </div>
              <div>
                <Label>Montant de la compensation</Label>
                <Input
                  type="number"
                  value={compensationAmount}
                  onChange={(e) => setCompensationAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Lieu</Label>
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <Label>Type de stage</Label>
                <Select 
                  value={type} 
                  onValueChange={(value: StageType) => setType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temps_plein">Temps plein</SelectItem>
                    <SelectItem value="temps_partiel">Temps partiel</SelectItem>
                    <SelectItem value="alternance">Alternance</SelectItem>
                    <SelectItem value="remote">Télétravail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date de début</Label>
                <Calendar
                  value={startDate}
                  onChange={(date) => startDate}
                />
              </div>
              <div>
                <Label>Date limite</Label>
                <Calendar
                  value={deadline}
                  onChange={(date) => setDeadline(date)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={loading}>
                  {loading ? "En cours..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
      <div className="relative w-full max-w-2xl mx-auto mt-10">
        <Card className="rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Ajouter une offre de stage</CardTitle>
            <CardDescription>
              Décrivez votre stage en détail. L'IA remplira automatiquement les autres champs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handlePreview} className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="description">Description complète du stage</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Lieu du stage</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Type de stage</Label>
                <Select 
                  value={type} 
                  onValueChange={(value: StageType) => setType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temps_plein">Temps plein</SelectItem>
                    <SelectItem value="temps_partiel">Temps partiel</SelectItem>
                    <SelectItem value="alternance">Alternance</SelectItem>
                    <SelectItem value="remote">Télétravail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Génération en cours..." : "Générer les suggestions"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
