import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import fr from "date-fns/locale/fr";

interface EditProfileFormProps {
  initialData: {
    nom: string;
    titre: string;
    localisation: string;
    ecole: string;
    formation: string;
    disponibilite: string;
    competences: string[];
    bio?: string;
    photo?: string;
  };
  onSubmit: (data: any) => void;
}

export function EditProfileForm({ initialData, onSubmit }: EditProfileFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompetencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const competences = e.target.value.split(",").map((s) => s.trim());
    setFormData((prev) => ({ ...prev, competences }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      ...formData, 
      disponibilite: selectedDate ? format(selectedDate, "MMMM yyyy", { locale: fr }) : formData.disponibilite 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="photo">Photo de profil</Label>
          <div className="mt-1 flex items-center gap-4">
            <img
              src={formData.photo || "https://via.placeholder.com/150"}
              alt="Photo de profil"
              className="h-16 w-16 rounded-full object-cover"
            />
            <Button type="button" variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Changer la photo
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="nom">Nom complet</Label>
          <Input
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="titre">Titre professionnel</Label>
          <Input
            id="titre"
            name="titre"
            value={formData.titre}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="mt-1"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="localisation">Localisation</Label>
          <Input
            id="localisation"
            name="localisation"
            value={formData.localisation}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="ecole">École</Label>
          <Input
            id="ecole"
            name="ecole"
            value={formData.ecole}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="formation">Formation actuelle</Label>
          <Input
            id="formation"
            name="formation"
            value={formData.formation}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Disponibilité</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-1",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                disabled={(date) => date < new Date()}
                locale={fr}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="competences">Compétences (séparées par des virgules)</Label>
          <Input
            id="competences"
            name="competences"
            value={formData.competences.join(", ")}
            onChange={handleCompetencesChange}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit">
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}
