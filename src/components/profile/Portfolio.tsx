
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Project } from './types/ProjectTypes';
import { ProjectsGrid } from './ProjectsGrid';
import { AddProjectModal } from './AddProjectModal';
import { projectsService } from './ProjectsService';

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch projects
    const fetchProjects = async () => {
      try {
        const data = await projectsService.getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsAddProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsAddProjectModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectsService.deleteProject(projectId);
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const handleSubmitProject = async (projectData: Omit<Project, "id">) => {
    try {
      if (selectedProject) {
        // Update existing project
        const updatedProject = await projectsService.updateProject(selectedProject.id, projectData);
        setProjects(projects.map(project => 
          project.id === selectedProject.id ? updatedProject : project
        ));
      } else {
        // Add new project
        const newProject = await projectsService.addProject(projectData);
        setProjects([...projects, newProject]);
      }
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Portfolio</h2>
        <Button onClick={handleAddProject}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No projects yet. Click "Add Project" to create your first project.
        </div>
      ) : (
        <ProjectsGrid 
          projects={projects} 
          onEdit={handleEditProject} 
          onDelete={handleDeleteProject} 
        />
      )}
      
      {isAddProjectModalOpen && (
        <AddProjectModal
          isOpen={isAddProjectModalOpen}
          onClose={() => setIsAddProjectModalOpen(false)}
          onSave={handleSubmitProject}
          initialData={selectedProject}
        />
      )}
    </div>
  );
}
