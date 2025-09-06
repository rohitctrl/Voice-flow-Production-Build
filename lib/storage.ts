import { supabase } from './supabase'
import { supabaseAdmin } from './supabase-admin'
import { createServerSupabaseClient } from './supabase-server'

// Storage bucket for audio files
const AUDIO_BUCKET = 'audio-files'

export interface UploadResult {
  url: string
  path: string
  fullPath: string
}

// Upload audio file to Supabase Storage with proper authentication
export async function uploadAudioFile(
  file: File,
  userId: string,
  transcriptionId?: string
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = transcriptionId 
      ? `${transcriptionId}.${fileExt}`
      : `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    const filePath = `${userId}/${fileName}`

    // Use admin client for storage operations with user validation
    // The userId is validated at the API level, so this is secure
    const { data, error } = await supabaseAdmin.storage
      .from(AUDIO_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL using admin client
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath,
      fullPath: data.path
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

// Delete audio file from storage
export async function deleteAudioFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

// Get signed URL for private file access
export async function getSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Error creating signed URL:', error)
    return null
  }
}

// Create storage bucket (run once during setup)
export async function createAudioBucket() {
  try {
    const { data, error } = await supabase.storage.createBucket(AUDIO_BUCKET, {
      public: false, // Files are private by default
      allowedMimeTypes: [
        'audio/mpeg',
        'audio/mp3', 
        'audio/wav',
        'audio/m4a',
        'audio/webm',
        'audio/ogg',
        'video/mp4',
        'video/webm'
      ],
      fileSizeLimit: 100 * 1024 * 1024 // 100MB
    })

    if (error && error.message !== 'Bucket already exists') {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error creating bucket:', error)
    return { success: false, error }
  }
}

// List user's audio files
export async function listUserAudioFiles(userId: string) {
  try {
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error listing files:', error)
    return []
  }
}

// Get file info
export async function getFileInfo(filePath: string) {
  try {
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .list('', {
        search: filePath
      })

    if (error) {
      throw error
    }

    return data?.[0] || null
  } catch (error) {
    console.error('Error getting file info:', error)
    return null
  }
}

// Storage utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export function isAudioFile(filename: string): boolean {
  const audioExtensions = ['mp3', 'wav', 'm4a', 'webm', 'ogg', 'aac']
  const extension = getFileExtension(filename)
  return audioExtensions.includes(extension)
}

export function isVideoFile(filename: string): boolean {
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi']
  const extension = getFileExtension(filename)
  return videoExtensions.includes(extension)
}

// Batch upload for multiple files
export async function uploadMultipleFiles(
  files: File[],
  userId: string,
  onProgress?: (progress: { completed: number; total: number; currentFile: string }) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    if (onProgress) {
      onProgress({
        completed: i,
        total: files.length,
        currentFile: file.name
      })
    }

    try {
      const result = await uploadAudioFile(file, userId)
      results.push(result)
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      // Continue with other files even if one fails
    }
  }

  if (onProgress) {
    onProgress({
      completed: files.length,
      total: files.length,
      currentFile: ''
    })
  }

  return results
}

// Cleanup old files (for maintenance)
export async function cleanupOldFiles(userId: string, daysOld = 30): Promise<number> {
  try {
    const files = await listUserAudioFiles(userId)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    let deletedCount = 0
    
    for (const file of files) {
      const fileDate = new Date(file.created_at || '')
      if (fileDate < cutoffDate) {
        const filePath = `${userId}/${file.name}`
        const success = await deleteAudioFile(filePath)
        if (success) deletedCount++
      }
    }

    return deletedCount
  } catch (error) {
    console.error('Error cleaning up old files:', error)
    return 0
  }
}