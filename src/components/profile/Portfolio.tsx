
import React, { useState, useEffect } from 'react';
import { Plus, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Project } from './types/ProjectTypes';
import { ProjectsGrid } from './ProjectsGrid';
import { AddProjectModal } from './AddProjectModal';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [premiumStatus, setPremiumStatus] = useState(false);
  const { user } = useAuth();
  const isOwner = window.location.pathname.includes(user?.id || '');

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // Extract stagiaire ID from URL
        const urlParts = window.location.pathname.split('/');
        const stagiaireId = urlParts[urlParts.length - 1];
        
        if (!stagiaireId) {
          setIsLoading(false);
          return;
        }
        
        // Fetch premium status first
        const { data: stagiaireData, error: stagiaireError } = await supabase
          .from('stagiaires')
          .select('is_premium')
          .eq('id', stagiaireId)
          .single();
          
        if (stagiaireError) {
          console.error("Error fetching stagiaire data:", stagiaireError);
        } else if (stagiaireData) {
          setPremiumStatus(stagiaireData.is_premium);
        }
        
        // Fetch projects
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('stagiaire_id', stagiaireId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching projects:", error);
          toast.error("Erreur lors du chargement des projets");
        } else {
          setProjects(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleAddProject = () => {
    // Check if non-premium user already has one project
    if (!premiumStatus && projects.length >= 1 && isOwner) {
      toast.error("Vous devez passer à la version Premium pour ajouter plus d'un projet");
      return;
    }
    
    setSelectedProject(null);
    setIsAddProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsAddProjectModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
        
      if (error) {
        throw error;
      }
      
      setProjects(projects.filter(project => project.id !== projectId));
      toast.success("Projet supprimé avec succès");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Échec de la suppression du projet");
    }
  };

  const handleSubmitProject = async (projectData: Omit<Project, "id">) => {
    try {
      if (selectedProject) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update({
            title: projectData.title,
            description: projectData.description,
            short_description: projectData.short_description,
            domain: projectData.domain,
            technologies: projectData.technologies,
            image_url: projectData.image_url,
            project_url: projectData.project_url,
            github_url: projectData.github_url,
            status: projectData.status,
            highlights: projectData.highlights,
            role: projectData.role,
            updated_at: new Date()
          })
          .eq('id', selectedProject.id)
          .select()
          .single();
          
        if (error) throw error;
        
        setProjects(projects.map(project => 
          project.id === selectedProject.id ? data : project
        ));
        
        toast.success("Projet mis à jour avec succès");
      } else {
        // Add new project
        const { data, error } = await supabase
          .from('projects')
          .insert({
            ...projectData,
            stagiaire_id: user?.id,
            created_at: new Date(),
            updated_at: new Date()
          })
          .select()
          .single();
          
        if (error) throw error;
        
        setProjects([...projects, data]);
        toast.success("Projet ajouté avec succès");
      }
      
      setIsAddProjectModalOpen(false);
    } catch (error) {
      console.error("Failed to save project:", error);
      toast.error("Échec de l'enregistrement du projet");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Portfolio</h2>
        {isOwner && (
          <Button onClick={handleAddProject}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un projet
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucun projet dans le portfolio.
          {isOwner && " Cliquez sur \"Ajouter un projet\" pour créer votre premier projet."}
        </div>
      ) : (
        <>
          <ProjectsGrid 
            projects={projects} 
            onEdit={isOwner ? handleEditProject : undefined} 
            onDelete={isOwner ? handleDeleteProject : undefined} 
          />
          
          {!premiumStatus && isOwner && projects.length >= 1 && (
            <div className="mt-8 p-4 border rounded-lg bg-muted/10 flex items-center justify-between">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-amber-500 mr-2" />
                <span>Passez à la version Premium pour ajouter plus de projets à votre portfolio</span>
              </div>
              <Button variant="default" onClick={() => window.location.href = "/abonnement"}>
                Passer à Premium
              </Button>
            </div>
          )}
        </>
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
