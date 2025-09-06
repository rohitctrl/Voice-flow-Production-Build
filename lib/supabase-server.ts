import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create server-side Supabase client with NextAuth session
export async function createServerSupabaseClient() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('No authenticated user found')
  }

  // Create Supabase client with user context
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        // Pass user ID to Supabase for RLS
        'X-User-ID': session.user.id,
      }
    }
  })

  // Set the user context for RLS policies
  // This simulates the auth.uid() function that RLS policies expect
  try {
    await supabase.rpc('set_user_id', { user_id: session.user.id });
  } catch (error) {
    // If the function doesn't exist, we'll create it via SQL
    console.log('Note: set_user_id function not found - will need to create it in Supabase')
  }

  return { supabase, userId: session.user.id, user: session.user }
}