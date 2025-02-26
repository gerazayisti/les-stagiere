import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export interface Project {
  id: string;
  title: string;
  description: string;
  domain: string;
  technologies: string[];
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  startDate: string;
  endDate: string;
  status: "completed" | "in_progress" | "planned";
}

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, "id">) => void;
}

const DOMAINS = [
  "Développement Web",
  "Développement Mobile",
  "Intelligence Artificielle",
  "Science des Données",
  "Cybersécurité",
  "DevOps",
  "Design UI/UX",
  "Marketing Digital",
  "Gestion de Projet",
  "Commerce",
  "Finance",
  "Ressources Humaines",
  "Communication",
  "Santé",
  "Éducation",
  "Agriculture",
  "Environnement",
  "Autre"
];

export function AddProjectModal({ isOpen, onClose, onSubmit }: AddProjectModalProps) {
  const [technologies, setTechnologies] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const project = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      domain: formData.get("domain") as string,
      technologies: technologies.split(",").map(tech => tech.trim()),
      projectUrl: formData.get("projectUrl") as string,
      githubUrl: formData.get("githubUrl") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      status: formData.get("status") as "completed" | "in_progress" | "planned",
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };

    onSubmit(project);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau projet</DialogTitle>
          <DialogDescription>
            Ajoutez les détails de votre projet pour enrichir votre portfolio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre du projet *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Mon super projet"
                required
              />
            </div>

            <div>
              <Label htmlFor="domain">Domaine *</Label>
              <Select name="domain" required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Décrivez votre projet, ses objectifs et ses résultats..."
                className="h-32"
                required
              />
            </div>

            <div>
              <Label htmlFor="technologies">Technologies utilisées *</Label>
              <Input
                id="technologies"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="React, Node.js, MongoDB (séparées par des virgules)"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Date de début *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Statut *</Label>
              <Select name="status" required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="planned">Planifié</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="projectUrl">URL du projet</Label>
              <Input
                id="projectUrl"
                name="projectUrl"
                type="url"
                placeholder="https://monprojet.com"
              />
            </div>

            <div>
              <Label htmlFor="githubUrl">URL GitHub</Label>
              <Input
                id="githubUrl"
                name="githubUrl"
                type="url"
                placeholder="https://github.com/username/project"
              />
            </div>

            <div>
              <Label htmlFor="image">Image du projet</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImageFile(file);
                }}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Format recommandé : PNG, JPG (max 2MB)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Ajouter le projet</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
