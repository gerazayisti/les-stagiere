
import { UserRole } from "@/lib/auth";

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
  isRetryable?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  role: UserRole;
  name: string;
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
  user_metadata?: any;
}

export interface SupabaseAuthError {
  message: string;
  status?: number;
  code?: string;
}
