
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
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || "");
  const [requirements, setRequirements] = useState(initialData?.requirements || "");
  const [responsibilities, setResponsibilities] = useState(initialData?.responsibilities || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [remotePolicy, setRemotePolicy] = useState(initialData?.remote_policy || "");
  const [type, setType] = useState<StageType>(initialData?.type as StageType || "temps_plein");
  const [duration, setDuration] = useState(initialData?.duration || "");
  const [startDate, setStartDate] = useState<Date | undefined>(initialData?.start_date ? new Date(initialData.start_date) : undefined);
  const [compensationAmount, setCompensationAmount] = useState(initialData?.compensation?.amount || 0);
  const [compensationCurrency, setCompensationCurrency] = useState(initialData?.compensation?.currency || "EUR");
  const [compensationPeriod, setCompensationPeriod] = useState(initialData?.compensation?.period || "mois");
  const emptySkillsArray: [string, ...string[]] = [''];
  
  const [requiredSkills, setRequiredSkills] = useState<[string, ...string[]]>(initialData?.required_skills ? (initialData.required_skills as [string, ...string[]]) : emptySkillsArray);
  const [preferredSkills, setPreferredSkills] = useState<[string, ...string[]]>(initialData?.preferred_skills ? (initialData.preferred_skills as [string, ...string[]]) : emptySkillsArray);
  const [educationLevel, setEducationLevel] = useState(initialData?.education_level || "");
  const [status, setStatus] = useState<StageStatus>(initialData?.status as StageStatus || "draft");
  const [deadline, setDeadline] = useState<Date | undefined>(initialData?.deadline ? new Date(initialData.deadline) : undefined);
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false);
  const [isUrgent, setIsUrgent] = useState(initialData?.is_urgent || false);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('name');

      if (error) {
        console.error("Erreur lors de la récupération des compétences:", error);
      } else {
        const skillNames = data.map(skill => skill.name);
        setSkills(skillNames);
      }
    };

    fetchSkills();
  }, []);

  const handleAddRequiredSkill = (skill: string) => {
    if (skill && !requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill] as [string, ...string[]]);
    }
  };

  const handleRemoveRequiredSkill = (index: number) => {
    const updatedSkills = [...requiredSkills];
    updatedSkills.splice(index, 1);
    
    if (updatedSkills.length === 0) {
      setRequiredSkills(emptySkillsArray);
    } else {
      setRequiredSkills(updatedSkills as [string, ...string[]]);
    }
  };

  const handleAddPreferredSkill = (skill: string) => {
    if (skill && !preferredSkills.includes(skill)) {
      setPreferredSkills([...preferredSkills, skill] as [string, ...string[]]);
    }
  };

  const handleRemovePreferredSkill = (index: number) => {
    const updatedSkills = [...preferredSkills];
    updatedSkills.splice(index, 1);

    if (updatedSkills.length === 0) {
      setPreferredSkills(emptySkillsArray);
    } else {
      setPreferredSkills(updatedSkills as [string, ...string[]]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stageData: Partial<Stage> = {
        id: initialData?.id || '',
        title,
        description,
        short_description: shortDescription,
        requirements,
        responsibilities,
        location,
        remote_policy: remotePolicy,
        type,
        duration,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        compensation: {
          amount: compensationAmount,
          currency: compensationCurrency,
          period: compensationPeriod,
        },
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
        education_level: educationLevel,
        entreprise_id: '', // This should be populated from context or props
        status,
        created_at: initialData?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deadline: deadline ? format(deadline, 'yyyy-MM-dd') : '',
        is_featured: isFeatured,
        is_urgent: isUrgent,
        views_count: initialData?.views_count || 0,
        applications_count: initialData?.applications_count || 0,
      };

      onSave(stageData as Stage);
      onClose();
      toast.success("Stage ajouté avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'ajout du stage:", error);
      toast.error("Erreur lors de l'ajout du stage");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
      <div className="relative w-full max-w-2xl mx-auto mt-10">
        <Card className="rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Ajouter une offre de stage</CardTitle>
            <CardDescription>
              Remplissez les informations ci-dessous pour créer une nouvelle offre de stage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title">Titre du stage</Label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shortDescription">Description courte</Label>
                <Input
                  type="text"
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description complète</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="requirements">Exigences</Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="responsibilities">Responsabilités</Label>
                <Textarea
                  id="responsibilities"
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Lieu</Label>
                <Input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="remotePolicy">Politique de télétravail</Label>
                <Input
                  type="text"
                  id="remotePolicy"
                  value={remotePolicy}
                  onChange={(e) => setRemotePolicy(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="type">Type de stage</Label>
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
                <Label htmlFor="duration">Durée</Label>
                <Input
                  type="text"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div>
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center" side="bottom">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Date limite</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center" side="bottom">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Compétences requises</Label>
                <ListSkills skills={skills} onAddSkill={handleAddRequiredSkill} onRemoveSkill={handleRemoveRequiredSkill} selectedSkills={requiredSkills} />
              </div>
              <div>
                <Label>Compétences préférées</Label>
                <ListSkills skills={skills} onAddSkill={handleAddPreferredSkill} onRemoveSkill={handleRemovePreferredSkill} selectedSkills={preferredSkills} />
              </div>
              <div>
                <Label htmlFor="educationLevel">Niveau d'éducation</Label>
                <Input
                  type="text"
                  id="educationLevel"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="compensationAmount">Montant de la compensation</Label>
                <Input
                  type="number"
                  id="compensationAmount"
                  value={compensationAmount}
                  onChange={(e) => setCompensationAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="compensationCurrency">Devise de la compensation</Label>
                <Select value={compensationCurrency} onValueChange={setCompensationCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la devise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="compensationPeriod">Période de compensation</Label>
                <Select value={compensationPeriod} onValueChange={setCompensationPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heure">Heure</SelectItem>
                    <SelectItem value="jour">Jour</SelectItem>
                    <SelectItem value="semaine">Semaine</SelectItem>
                    <SelectItem value="mois">Mois</SelectItem>
                    <SelectItem value="annee">Année</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select 
                  value={status} 
                  onValueChange={(value: StageStatus) => setStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="expired">Expiré</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(!!checked)}
                />
                <Label htmlFor="isFeatured">En vedette</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isUrgent"
                  checked={isUrgent}
                  onCheckedChange={(checked) => setIsUrgent(!!checked)}
                />
                <Label htmlFor="isUrgent">Urgent</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={onClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
