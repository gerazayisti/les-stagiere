
export interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  github_url: string;
  live_url: string; // Added this property
  technologies: string[];
  created_at: string; // Added this property
}
