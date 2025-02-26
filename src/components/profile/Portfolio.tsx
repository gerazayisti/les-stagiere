import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Github,
  Globe,
  Code,
  Laptop,
  Monitor,
  Smartphone,
  Tags,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: "web" | "mobile" | "desktop";
  technologies: string[];
  links: {
    demo?: string;
    github?: string;
    live?: string;
  };
}

export function Portfolio() {
  const [filter, setFilter] = useState<"all" | "web" | "mobile" | "desktop">("all");

  const projects: Project[] = [
    {
      id: "1",
      title: "E-commerce Platform",
      description:
        "Une plateforme e-commerce complète avec panier, paiement et gestion des commandes",
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      category: "web",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      links: {
        demo: "#",
        github: "#",
        live: "#",
      },
    },
    {
      id: "2",
      title: "Fitness Tracker App",
      description:
        "Application mobile pour suivre ses activités sportives et sa nutrition",
      image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      category: "mobile",
      technologies: ["React Native", "Firebase", "Redux"],
      links: {
        github: "#",
        live: "#",
      },
    },
    {
      id: "3",
      title: "Task Management Desktop",
      description: "Application desktop de gestion de tâches et de projets",
      image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1176&q=80",
      category: "desktop",
      technologies: ["Electron", "React", "SQLite"],
      links: {
        demo: "#",
        github: "#",
      },
    },
  ];

  const categoryIcons = {
    web: Monitor,
    mobile: Smartphone,
    desktop: Laptop,
  };

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((project) => project.category === filter);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="flex items-center gap-2"
        >
          <Code className="w-4 h-4" />
          Tous
        </Button>
        <Button
          variant={filter === "web" ? "default" : "outline"}
          onClick={() => setFilter("web")}
          className="flex items-center gap-2"
        >
          <Monitor className="w-4 h-4" />
          Web
        </Button>
        <Button
          variant={filter === "mobile" ? "default" : "outline"}
          onClick={() => setFilter("mobile")}
          className="flex items-center gap-2"
        >
          <Smartphone className="w-4 h-4" />
          Mobile
        </Button>
        <Button
          variant={filter === "desktop" ? "default" : "outline"}
          onClick={() => setFilter("desktop")}
          className="flex items-center gap-2"
        >
          <Laptop className="w-4 h-4" />
          Desktop
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const CategoryIcon = categoryIcons[project.category];

          return (
            <Card key={project.id} className="overflow-hidden group">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  {project.links.demo && (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-primary transition-colors"
                    >
                      <Globe className="w-6 h-6" />
                    </a>
                  )}
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-primary transition-colors"
                    >
                      <Github className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CategoryIcon className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">{project.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {project.description}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Tags className="w-4 h-4 text-muted-foreground" />
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
