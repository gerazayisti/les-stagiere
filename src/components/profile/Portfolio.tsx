import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner';

// Define the Project interface
interface Project {
  id: string;
  title: string;
  description: string;
  short_description: string;
  domain: string;
  technologies: string[];
  image_url: string;
  gallery_urls: string[];
  project_url: string;
  github_url: string;
  start_date: Date | null;
  end_date: Date | null;
  status: 'completed' | 'in_progress' | 'planned';
  highlights: string[];
  team_size: number;
  role: string;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
}

// Define the schema for the project form
const projectSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  short_description: z.string().max(500, {
    message: "Short description must be less than 500 characters.",
  }),
  domain: z.string().min(2, {
    message: "Domain must be at least 2 characters.",
  }),
  technologies: z.array(z.string()),
  image_url: z.string().url({
    message: "Image URL must be a valid URL.",
  }),
  gallery_urls: z.array(z.string().url({
    message: "Gallery URLs must be valid URLs.",
  })),
  project_url: z.string().url({
    message: "Project URL must be a valid URL.",
  }),
  github_url: z.string().url({
    message: "GitHub URL must be a valid URL.",
  }),
  start_date: z.date(),
  end_date: z.date(),
  status: z.enum(['completed', 'in_progress', 'planned']),
  highlights: z.array(z.string()),
  team_size: z.number().min(1, {
    message: "Team size must be at least 1.",
  }),
  role: z.string().min(2, {
    message: "Role must be at least 2 characters.",
  }),
  is_featured: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
})

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Omit<Project, "id">) => void;
  initialData?: Project | null;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      short_description: initialData?.short_description || "",
      domain: initialData?.domain || "",
      technologies: initialData?.technologies || [],
      image_url: initialData?.image_url || "",
      gallery_urls: initialData?.gallery_urls || [],
      project_url: initialData?.project_url || "",
      github_url: initialData?.github_url || "",
      start_date: initialData?.start_date || new Date(),
      end_date: initialData?.end_date || new Date(),
      status: initialData?.status || "completed",
      highlights: initialData?.highlights || [],
      team_size: initialData?.team_size || 1,
      role: initialData?.role || "",
      is_featured: initialData?.is_featured || false,
      created_at: initialData?.created_at || new Date(),
      updated_at: initialData?.updated_at || new Date(),
    },
  })

  function onSubmit(values: z.infer<typeof projectSchema>) {
    onSave(values);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>
            Add a new project to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Project Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Project Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Short Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input placeholder="Domain" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="technologies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies</FormLabel>
                  <FormControl>
                    <Input placeholder="Technologies" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gallery_urls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gallery URLs</FormLabel>
                  <FormControl>
                    <Input placeholder="Gallery URLs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="project_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Project URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="github_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL</FormLabel>
                  <FormControl>
                    <Input placeholder="GitHub URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Input placeholder="Status" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="highlights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highlights</FormLabel>
                  <FormControl>
                    <Input placeholder="Highlights" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="team_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Size</FormLabel>
                  <FormControl>
                    <Input placeholder="Team Size" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="Role" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is Featured</FormLabel>
                  <FormControl>
                    <Input type="checkbox" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="created_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Created At</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="updated_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Updated At</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    // Fetch projects from database or API here
    // For now, let's use dummy data
    const dummyProjects: Project[] = [
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
    setProjects(dummyProjects);
  }, []);

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsAddProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsAddProjectModalOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    // Implement delete logic here
    const updatedProjects = projects.filter((project) => project.id !== projectId);
    setProjects(updatedProjects);
    toast.success("Project deleted successfully!");
  };

  const handleSubmitProject = (projectData: Omit<Project, "id">) => {
    if (selectedProject) {
      // Implement update logic here
      const updatedProjects = projects.map((project) =>
        project.id === selectedProject.id ? { ...project, ...projectData } : project
      );
      setProjects(updatedProjects);
      toast.success("Project updated successfully!");
    } else {
      // Implement add logic here
      const newProject: Project = { id: uuidv4(), ...projectData } as Project;
      setProjects([...projects, newProject]);
      toast.success("Project added successfully!");
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
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="bg-white shadow-md rounded-md overflow-hidden">
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.short_description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <img src={project.image_url} alt={project.title} className="w-full h-32 object-cover rounded-md mb-4" />
              <div className="flex justify-between items-center">
                <Button variant="secondary" size="sm" onClick={() => handleEditProject(project)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(project.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
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
