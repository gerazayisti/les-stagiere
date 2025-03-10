
import { v4 as uuidv4 } from 'uuid';
import { Project } from './types/ProjectTypes';
import { toast } from 'sonner';

// Mock data generator for projects
export function getDummyProjects(): Project[] {
  return [
    {
      id: uuidv4(),
      title: "Project 1",
      description: "Description for Project 1",
      short_description: "Short description for Project 1",
      domain: "Web Development",
      technologies: ["React", "Node.js"],
      image_url: "https://via.placeholder.com/150",
      gallery_urls: ["https://via.placeholder.com/150"],
      project_url: "https://example.com/project1",
      github_url: "https://github.com/project1",
      start_date: new Date(),
      end_date: new Date(),
      status: "completed",
      highlights: ["Highlight 1", "Highlight 2"],
      team_size: 5,
      role: "Frontend Developer",
      is_featured: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      title: "Project 2",
      description: "Description for Project 2",
      short_description: "Short description for Project 2",
      domain: "Mobile Development",
      technologies: ["React Native", "Firebase"],
      image_url: "https://via.placeholder.com/150",
      gallery_urls: ["https://via.placeholder.com/150"],
      project_url: "https://example.com/project2",
      github_url: "https://github.com/project2",
      start_date: new Date(),
      end_date: new Date(),
      status: "in_progress",
      highlights: ["Highlight 1", "Highlight 2"],
      team_size: 3,
      role: "Mobile Developer",
      is_featured: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
}

// In a real application, these would make API calls
export const projectsService = {
  getProjects: async (): Promise<Project[]> => {
    // Simulate API fetch
    return getDummyProjects();
  },
  
  addProject: async (projectData: Omit<Project, "id">): Promise<Project> => {
    // Simulate API post
    const newProject: Project = { id: uuidv4(), ...projectData };
    toast.success("Project added successfully!");
    return newProject;
  },
  
  updateProject: async (projectId: string, projectData: Omit<Project, "id">): Promise<Project> => {
    // Simulate API put
    const updatedProject: Project = { id: projectId, ...projectData };
    toast.success("Project updated successfully!");
    return updatedProject;
  },
  
  deleteProject: async (projectId: string): Promise<void> => {
    // Simulate API delete
    toast.success("Project deleted successfully!");
  }
};
