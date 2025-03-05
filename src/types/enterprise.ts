
export interface EntrepriseData {
  id: string;
  name: string;
  email: string;
  logo_url?: string;
  description?: string;
  industry?: string;
  location?: string;
  benefits?: string[];
  website?: string;
  created_at?: string;
}

export interface Intern {
  id: string;
  name: string;
  avatar_url?: string;
  position?: string;
  period?: string;
  hasRecommendation: boolean;
}

export interface InternData {
  id: string;
  name: string;
  avatar_url?: string;
  position?: string;
  period?: string;
  hasRecommendation: boolean;
}
