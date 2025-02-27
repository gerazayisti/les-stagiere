import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'stagiaire' | 'entreprise'
          created_at: string
        }
        Insert: {
          email: string
          role: 'admin' | 'stagiaire' | 'entreprise'
        }
        Update: {
          email?: string
          role?: 'admin' | 'stagiaire' | 'entreprise'
        }
      }
      stages: {
        Row: {
          id: string
          titre: string
          description: string
          entreprise_id: string
          created_at: string
        }
      }
      candidatures: {
        Row: {
          id: string
          stage_id: string
          stagiaire_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          nom: string
          email: string
          sujet: string
          message: string
          created_at: string
        }
      }
      uploads: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_path: string
          created_at: string
        }
      }
    }
  }
}
