
export interface EntrepriseData {
  id: string;
  name: string;
  bio?: string;
  logo_url?: string;
  address?: string;
  industry?: string;
  size?: string;
  founded?: string;
  phone?: string;
  email?: string;
  website?: string; // Added this property
}

export interface InternData {
  id: string;
  name: string;
  avatar_url?: string;
  status: "active" | "completed" | "pending";
  position?: string;
  department?: string;
  start_date?: string;
  end_date?: string;
  hasRecommendation?: boolean;
}

export interface Intern extends InternData {
  hasRecommendation: boolean;
}
