import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import fr from "date-fns/locale/fr";

interface Stage {
  id: number;
  titre: string;
  description: string;
  duree: string;
  dateDebut: Date;
  competencesRequises: string[];
  remuneration?: string;
}

interface GestionStagesProps {
  stages: Stage[];
  onUpdate: (stages: Stage[]) => void;
}

export function GestionStages({ stages: initialStages, onUpdate }: GestionStagesProps) {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [newStage, setNewStage] = useState<Partial<Stage>>({
    competencesRequises: [],
  });
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "competencesRequises") {
      setNewStage((prev) => ({
        ...prev,
        [name]: value.split(",").map((s) => s.trim()),
      }));
    } else {
      setNewStage((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddStage = () => {
    if (newStage.titre && newStage.description && selectedDate) {
      const stage: Stage = {
        id: Date.now(),
        titre: newStage.titre,
        description: newStage.description,
        duree: newStage.duree || "",
        dateDebut: selectedDate,
        competencesRequises: newStage.competencesRequises || [],
        remuneration: newStage.remuneration,
      };

      const updatedStages = [...stages, stage];
      setStages(updatedStages);
      onUpdate(updatedStages);

      // Reset form
      setNewStage({ competencesRequises: [] });
      setSelectedDate(undefined);
    }
  };

  const handleDeleteStage = (id: number) => {
    const updatedStages = stages.filter((stage) => stage.id !== id);
    setStages(updatedStages);
    onUpdate(updatedStages);
  };

  return (
    <div className="space-y-8">
      {/* Liste des stages existants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Stages actifs</h3>
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{stage.titre}</h4>
                <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>Durée : {stage.duree}</span>
                  <span>
                    Début : {format(stage.dateDebut, "MMMM yyyy", { locale: fr })}
                  </span>
                </div>
                {stage.competencesRequises.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Compétences requises :</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {stage.competencesRequises.map((comp) => (
                        <span
                          key={comp}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {stage.remuneration && (
                  <p className="mt-2 text-sm text-gray-600">
                    Rémunération : {stage.remuneration}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteStage(stage.id)}
                className="text-gray-500 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire d'ajout de stage */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Ajouter un nouveau stage</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="titre">Titre du stage</Label>
            <Input
              id="titre"
              name="titre"
              value={newStage.titre || ""}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="ex: Développeur Full-Stack"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={newStage.description || ""}
              onChange={handleInputChange}
              className="mt-1"
              rows={4}
              placeholder="Décrivez les responsabilités et objectifs du stage..."
            />
          </div>

          <div>
            <Label htmlFor="duree">Durée</Label>
            <Input
              id="duree"
              name="duree"
              value={newStage.duree || ""}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="ex: 6 mois"
            />
          </div>

          <div>
            <Label>Date de début</Label>
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
            <Label htmlFor="competencesRequises">
              Compétences requises (séparées par des virgules)
            </Label>
            <Input
              id="competencesRequises"
              name="competencesRequises"
              value={newStage.competencesRequises?.join(", ") || ""}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="ex: React, TypeScript, Node.js"
            />
          </div>

          <div>
            <Label htmlFor="remuneration">Rémunération (optionnel)</Label>
            <Input
              id="remuneration"
              name="remuneration"
              value={newStage.remuneration || ""}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="ex: 1000€/mois"
            />
          </div>

          <Button
            type="button"
            onClick={handleAddStage}
            className="w-full"
            disabled={!newStage.titre || !newStage.description || !selectedDate}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter le stage
          </Button>
        </div>
      </div>
    </div>
  );
}
