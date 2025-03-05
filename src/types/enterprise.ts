
export interface EntrepriseData {
  id: string;
  name: string;
  logo_url?: string;
  cover_url?: string;
  description?: string;
  industry?: string;
  size?: string;
  founded_year?: number;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  social_media?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  created_at?: string;
}

export interface Intern {
  id: string;
  name: string;
  avatar_url?: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  hasRecommendation?: boolean;
}

export interface InternData {
  id: string;
  name: string;
  avatar_url?: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  hasRecommendation?: boolean;
}
