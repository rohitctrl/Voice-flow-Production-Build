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
          subscription_tier?: 'free' | 'pro' | 'enterprise'
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price_monthly: number
          price_yearly: number | null
          features: any[]
          limits: Record<string, any>
          razorpay_plan_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price_monthly: number
          price_yearly?: number | null
          features?: any[]
          limits?: Record<string, any>
          razorpay_plan_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_monthly?: number
          price_yearly?: number | null
          features?: any[]
          limits?: Record<string, any>
          razorpay_plan_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          razorpay_subscription_id: string | null
          razorpay_customer_id: string | null
          status: 'created' | 'authenticated' | 'active' | 'paused' | 'halted' | 'cancelled' | 'expired'
          billing_cycle: 'monthly' | 'yearly'
          current_period_start: string | null
          current_period_end: string | null
          trial_start: string | null
          trial_end: string | null
          cancelled_at: string | null
          ended_at: string | null
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          razorpay_subscription_id?: string | null
          razorpay_customer_id?: string | null
          status?: 'created' | 'authenticated' | 'active' | 'paused' | 'halted' | 'cancelled' | 'expired'
          billing_cycle?: 'monthly' | 'yearly'
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          cancelled_at?: string | null
          ended_at?: string | null
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          razorpay_subscription_id?: string | null
          razorpay_customer_id?: string | null
          status?: 'created' | 'authenticated' | 'active' | 'paused' | 'halted' | 'cancelled' | 'expired'
          billing_cycle?: 'monthly' | 'yearly'
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          cancelled_at?: string | null
          ended_at?: string | null
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
          amount: number
          currency: string
          status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
          method: string | null
          description: string | null
          receipt: string | null
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          amount: number
          currency?: string
          status?: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
          method?: string | null
          description?: string | null
          receipt?: string | null
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          amount?: number
          currency?: string
          status?: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
          method?: string | null
          description?: string | null
          receipt?: string | null
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          resource_type: string
          usage_count: number
          usage_limit: number | null
          period_start: string
          period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          resource_type: string
          usage_count?: number
          usage_limit?: number | null
          period_start: string
          period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          resource_type?: string
          usage_count?: number
          usage_limit?: number | null
          period_start?: string
          period_end?: string
          created_at?: string
          updated_at?: string
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
      subscription_tier: 'free' | 'pro' | 'enterprise'
      transcription_status: 'uploading' | 'processing' | 'completed' | 'error'
      subscription_status: 'created' | 'authenticated' | 'active' | 'paused' | 'halted' | 'cancelled' | 'expired'
      payment_status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
      billing_cycle: 'monthly' | 'yearly'
    }
  }
}