
export interface Project {
  id?: string;
  title: string;
  description: string;
  url?: string | null;
  image_url?: string | null;
  tags?: string[];
  technologies?: string[];
  stagiaire_id?: string;
  domain?: string;
  short_description?: string;
  github_url?: string | null;
  gallery_urls?: string[];
  start_date?: string;
  end_date?: string;
  status?: 'completed' | 'in_progress' | 'planned';
  highlights?: string[];
  team_size?: number;
  role?: string;
  is_featured?: boolean;
}
