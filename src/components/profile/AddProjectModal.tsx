
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, "id">) => void;
  initialData?: Project;
}

export function AddProjectModal({ isOpen, onClose, onSubmit, initialData }: AddProjectModalProps) {
  const [project, setProject] = useState<Omit<Project, "id">>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    technologies: initialData?.technologies || [],
    link: initialData?.link || "",
    year: initialData?.year || new Date().getFullYear(),
  });

  const [techInput, setTechInput] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProject({ ...project, [name]: value });
  };

  const handleAddTech = () => {
    if (techInput.trim() !== "" && !project.technologies.includes(techInput.trim())) {
      setProject({
        ...project,
        technologies: [...project.technologies, techInput.trim()],
      });
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setProject({
      ...project,
      technologies: project.technologies.filter((t) => t !== tech),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(project);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Modifier le projet" : "Ajouter un nouveau projet"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du projet</Label>
              <Input
                id="title"
                name="title"
                value={project.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={project.description}
                onChange={handleChange}
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de l'image</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={project.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Lien du projet</Label>
              <Input
                id="link"
                name="link"
                value={project.link}
                onChange={handleChange}
                placeholder="https://example.com/project"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Année</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={project.year}
                onChange={handleChange}
                required
                min={2000}
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tech">Technologies</Label>
              <div className="flex space-x-2">
                <Input
                  id="tech"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="React, Node.js, etc."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                />
                <Button type="button" onClick={handleAddTech} variant="outline">
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {project.technologies.map((tech) => (
                  <div
                    key={tech}
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                {initialData ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
