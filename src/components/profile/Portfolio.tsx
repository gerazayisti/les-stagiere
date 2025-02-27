
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, Github, Image as ImageIcon } from "lucide-react";
import { AddProjectModal } from "./AddProjectModal";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image_url?: string;
  project_url?: string;
  github_url?: string;
}

interface PortfolioProps {
  projects: Project[];
  isOwner: boolean;
}

export function Portfolio({ projects = [], isOwner }: PortfolioProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleAddProject = (project: Project) => {
    // Cette fonction sera implémentée pour ajouter un projet à la base de données
    console.log("Ajouter projet:", project);
    setShowAddModal(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Portfolio</h2>
        {isOwner && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un projet
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">Aucun projet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isOwner
                ? "Commencez à montrer votre travail en ajoutant un projet à votre portfolio"
                : "Ce profil n'a pas encore ajouté de projets à son portfolio"}
            </p>
            {isOwner && (
              <Button
                className="mt-4"
                onClick={() => setShowAddModal(true)}
              >
                Ajouter votre premier projet
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              {project.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-2">
                  {project.github_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {project.project_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir le projet
                      </a>
                    </Button>
                  )}
                </div>
                {isOwner && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditProject(project)}
                  >
                    Modifier
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddProjectModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingProject(null);
          }}
          onSubmit={handleAddProject}
          initialData={editingProject}
        />
      )}
    </div>
  );
}
