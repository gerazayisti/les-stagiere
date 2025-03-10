
import { z } from "zod";

// Define the Project interface
export interface Project {
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
  start_date: Date;
  end_date: Date;
  status: 'completed' | 'in_progress' | 'planned';
  highlights: string[];
  team_size: number;
  role: string;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
}

// Define the schema for the project form
export const projectSchema = z.object({
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
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
