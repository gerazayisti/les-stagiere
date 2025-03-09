
export interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  github_url: string;
  live_url: string;
  technologies: string[];
  created_at: string;
}

export interface InternshipOffer {
  id: string;
  title: string;
  description: string;
  location: string;
  type: "temps_plein" | "temps_partiel" | "alternance" | "remote";
  duration: string;
  start_date: string;
  compensation: string;
  required_skills: string[];
  preferred_skills: string[];
  status: "active" | "closed" | "draft";
  created_at: string;
  entreprise_id: string;
}
