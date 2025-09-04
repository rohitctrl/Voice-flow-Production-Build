import { supabase } from './supabase'
import type { Database } from './supabase'

type Tables = Database['public']['Tables']
type Profile = Tables['profiles']['Row']
type Project = Tables['projects']['Row']
type Transcription = Tables['transcriptions']['Row']

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export async function createProfile(profile: Tables['profiles']['Insert']): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    return null
  }

  return data
}

export async function updateProfile(userId: string, updates: Tables['profiles']['Update']): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}

// Project functions
export async function getUserProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}

export async function createProject(project: Tables['projects']['Insert']): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    return null
  }

  return data
}

export async function updateProject(projectId: string, updates: Tables['projects']['Update']): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    return null
  }

  return data
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error('Error deleting project:', error)
    return false
  }

  return true
}

// Transcription functions
export async function getUserTranscriptions(userId: string, limit = 50): Promise<Transcription[]> {
  const { data, error } = await supabase
    .from('transcriptions')
    .select(`
      *,
      projects(name, color)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching transcriptions:', error)
    return []
  }

  return data || []
}

export async function getProjectTranscriptions(projectId: string): Promise<Transcription[]> {
  const { data, error } = await supabase
    .from('transcriptions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching project transcriptions:', error)
    return []
  }

  return data || []
}

export async function createTranscription(transcription: Tables['transcriptions']['Insert']): Promise<Transcription | null> {
  const { data, error } = await supabase
    .from('transcriptions')
    .insert(transcription)
    .select()
    .single()

  if (error) {
    console.error('Error creating transcription:', error)
    return null
  }

  return data
}

export async function updateTranscription(transcriptionId: string, updates: Tables['transcriptions']['Update']): Promise<Transcription | null> {
  const { data, error } = await supabase
    .from('transcriptions')
    .update(updates)
    .eq('id', transcriptionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating transcription:', error)
    return null
  }

  return data
}

export async function deleteTranscription(transcriptionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('transcriptions')
    .delete()
    .eq('id', transcriptionId)

  if (error) {
    console.error('Error deleting transcription:', error)
    return false
  }

  return true
}

// Statistics functions
export async function getUserStats(userId: string) {
  // Get total transcriptions count
  const { count: transcriptionCount } = await supabase
    .from('transcriptions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get total duration
  const { data: transcriptions } = await supabase
    .from('transcriptions')
    .select('duration')
    .eq('user_id', userId)
    .not('duration', 'is', null)

  const totalDuration = transcriptions?.reduce((sum, t) => sum + (t.duration || 0), 0) || 0

  // Get average accuracy
  const { data: accuracyData } = await supabase
    .from('transcriptions')
    .select('accuracy')
    .eq('user_id', userId)
    .not('accuracy', 'is', null)

  const avgAccuracy = accuracyData?.length
    ? accuracyData.reduce((sum, t) => sum + (t.accuracy || 0), 0) / accuracyData.length
    : 0

  // Get active projects count
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_archived', false)

  return {
    totalTranscriptions: transcriptionCount || 0,
    totalDuration: Math.round(totalDuration / 3600 * 10) / 10, // hours with 1 decimal
    averageAccuracy: Math.round(avgAccuracy * 10) / 10,
    activeProjects: projectCount || 0
  }
}

// Real-time subscriptions
export function subscribeToTranscriptions(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('transcriptions')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transcriptions',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}

export function subscribeToProjects(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('projects')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}