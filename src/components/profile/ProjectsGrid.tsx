
import React from 'react';
import { Project } from './types/ProjectTypes';
import { ProjectCard } from './ProjectCard';

interface ProjectsGridProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectsGrid({ projects, onEdit, onDelete }: ProjectsGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}
