
import React from 'react';
import { Project } from './types/ProjectTypes';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card className="bg-white shadow-md rounded-md overflow-hidden">
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>{project.short_description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <img src={project.image_url} alt={project.title} className="w-full h-32 object-cover rounded-md mb-4" />
        <div className="flex justify-between items-center">
          <Button variant="secondary" size="sm" onClick={() => onEdit(project)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(project.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
