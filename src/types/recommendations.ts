
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
  start_date: string;  // Changé de optionnel à obligatoire pour correspondre à l'usage
  end_date: string;    // Changé de optionnel à obligatoire pour correspondre à l'usage
  skills?: string[];
  achievements?: string[];
  is_public?: boolean;
  updated_at?: string;
}
