
import { useState } from "react";
import { Project } from "@/types/project";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, "id">) => void;
  initialData?: Partial<Project>;
}

export default function AddProjectModal({ isOpen, onClose, onSave, initialData }: AddProjectModalProps) {
  const [formData, setFormData] = useState<Omit<Project, "id">>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    image_url: initialData?.image_url || "",
    github_url: initialData?.github_url || "",
    live_url: initialData?.live_url || "",
    technologies: initialData?.technologies || [],
    created_at: initialData?.created_at || new Date().toISOString(),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTechnologiesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const technologies = e.target.value
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech !== "");
    setFormData({
      ...formData,
      technologies,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? "Modifier un projet" : "Ajouter un nouveau projet"}
          </DialogTitle>
          <DialogDescription>
            Partagez vos projets pour mettre en valeur vos compétences.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du projet</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL de l'image</Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github_url">Lien GitHub</Label>
              <Input
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="live_url">Lien du site</Label>
              <Input
                id="live_url"
                name="live_url"
                value={formData.live_url}
                onChange={handleChange}
                placeholder="https://myproject.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technologies">Technologies utilisées</Label>
              <Input
                id="technologies"
                name="technologies"
                value={formData.technologies.join(", ")}
                onChange={handleTechnologiesChange}
                placeholder="React, Node.js, MongoDB"
              />
              <p className="text-xs text-muted-foreground">
                Séparez les technologies par des virgules
              </p>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                {initialData?.id ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
