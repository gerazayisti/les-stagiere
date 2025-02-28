
export interface Recommendation {
  id: string;
  entreprise_id: string;
  stagiaire_id: string;
  position: string;
  department: string;
  period: string;
  content: string;
  rating: number;
  author_name: string;
  author_position: string;
  company_name: string;
  company_logo: string | null;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  start_date: string;
  end_date: string;
  skills: string[];
  achievements: string[];
}
