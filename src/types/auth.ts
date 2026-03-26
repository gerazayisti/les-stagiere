import { UserRole } from "@/lib/auth";

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
  isRetryable?: boolean;
  isNetworkError?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  // Shared
  location?: string;
  // Stagiaire
  title?: string;
  bio?: string;
  linkedin_url?: string;
  search_status?: string;
  disponibility?: string;
  skills?: string[];
  preferred_locations?: string[];
  languages?: string[];
  preferred_domains?: string[];
  // Entreprise
  industry?: string;
  description?: string;
  company_culture?: string;
  size?: string;
  founded_year?: string;
  website?: string;
  benefits?: string[];
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  email_confirmed_at?: string;
  user_metadata?: {
    website?: string;
    github?: string;
    linkedin?: string;
    [key: string]: any;
  };
}

export interface SupabaseAuthError {
  message: string;
  status?: number;
  code?: string;
}
