import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddProjectModal, Project } from "./AddProjectModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, ExternalLink, Github, Calendar } from "lucide-react";

export function Portfolio() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [projects, setProjects] = useState<Project[]>([]);

  const handleAddProject = (project: Omit<Project, "id">) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
    };
    setProjects([...projects, newProject]);
  };

  const filteredProjects = selectedDomain === "all"
    ? projects
    : projects.filter(project => project.domain === selectedDomain);

  const domains = ["all", ...new Set(projects.map(project => project.domain))];

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "planned":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "in_progress":
        return "En cours";
      case "planned":
        return "Planifié";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <Select
            value={selectedDomain}
            onValueChange={setSelectedDomain}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par domaine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les domaines</SelectItem>
              {domains.filter(d => d !== "all").map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Ajouter un projet
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Vous n'avez pas encore ajouté de projets à votre portfolio.
            Commencez par ajouter votre premier projet !
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              {project.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <Badge variant="outline">{project.domain}</Badge>
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{project.startDate}</span>
                  {project.endDate && (
                    <>
                      <span>-</span>
                      <span>{project.endDate}</span>
                    </>
                  )}
                </div>

                <div className="mt-2">
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusText(project.status)}
                  </Badge>
                </div>

                <p className="mt-4 text-muted-foreground">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-4 mt-6">
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Voir le projet
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary hover:underline"
                    >
                      <Github className="w-4 h-4 mr-1" />
                      Code source
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProject}
      />
    </div>
  );
}
