
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
  company_logo?: string;
  created_at: string;
  start_date?: string;
  end_date?: string;
  skills?: string[];
  achievements?: string[];
}
