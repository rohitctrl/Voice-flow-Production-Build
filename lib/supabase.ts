import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
          subscription_tier: 'free' | 'pro' | 'business'
        }
        Insert: {
          id: string
          name?: string | null
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          subscription_tier?: 'free' | 'pro' | 'business'
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          subscription_tier?: 'free' | 'pro' | 'business'
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          user_id: string
          created_at: string
          updated_at: string
          is_archived: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color: string
          user_id: string
          created_at?: string
          updated_at?: string
          is_archived?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          is_archived?: boolean
        }
      }
      transcriptions: {
        Row: {
          id: string
          title: string
          content: string | null
          duration: number | null
          accuracy: number | null
          status: 'uploading' | 'processing' | 'completed' | 'error'
          file_url: string | null
          file_name: string
          file_size: number
          user_id: string
          project_id: string | null
          speakers_count: number | null
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          duration?: number | null
          accuracy?: number | null
          status?: 'uploading' | 'processing' | 'completed' | 'error'
          file_url?: string | null
          file_name: string
          file_size: number
          user_id: string
          project_id?: string | null
          speakers_count?: number | null
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          duration?: number | null
          accuracy?: number | null
          status?: 'uploading' | 'processing' | 'completed' | 'error'
          file_url?: string | null
          file_name?: string
          file_size?: number
          user_id?: string
          project_id?: string | null
          speakers_count?: number | null
          language?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'pro' | 'business'
      transcription_status: 'uploading' | 'processing' | 'completed' | 'error'
    }
  }
}