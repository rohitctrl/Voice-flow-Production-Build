import { AssemblyAI } from 'assemblyai'

// Initialize AssemblyAI client
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!
})

export interface TranscriptionConfig {
  speakerLabels?: boolean
  autoHighlights?: boolean
  contentSafety?: boolean
  iabCategories?: boolean
  languageDetection?: boolean
  punctuate?: boolean
  formatText?: boolean
  dualChannel?: boolean
  webhookUrl?: string
  languageCode?: string
}

export interface TranscriptionResult {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  text?: string
  confidence?: number
  words?: Array<{
    text: string
    start: number
    end: number
    confidence: number
    speaker?: string
  }>
  speakers?: Array<{
    speaker: string
    count: number
  }>
  chapters?: Array<{
    gist: string
    headline: string
    summary: string
    start: number
    end: number
  }>
  error?: string
  audioUrl?: string
  webhookStatusCode?: number
}

// Upload audio file to AssemblyAI
export async function uploadAudioFile(audioFile: File | Buffer): Promise<string> {
  try {
    const uploadUrl = await client.files.upload(audioFile)
    return uploadUrl
  } catch (error) {
    console.error('Error uploading audio file:', error)
    throw new Error('Failed to upload audio file')
  }
}

// Submit transcription request
export async function submitTranscription(
  audioUrl: string,
  config: TranscriptionConfig = {}
): Promise<string> {
  try {
    const params = {
      audio_url: audioUrl,
      speaker_labels: config.speakerLabels || false,
      auto_highlights: config.autoHighlights || false,
      content_safety: config.contentSafety || false,
      iab_categories: config.iabCategories || false,
      language_detection: config.languageDetection || false,
      punctuate: config.punctuate !== false, // default to true
      format_text: config.formatText !== false, // default to true
      dual_channel: config.dualChannel || false,
      webhook_url: config.webhookUrl,
      language_code: config.languageCode || 'en_us',
    }

    const transcript = await client.transcripts.submit(params)
    return transcript.id
  } catch (error) {
    console.error('Error submitting transcription:', error)
    throw new Error('Failed to submit transcription')
  }
}

// Get transcription result
export async function getTranscriptionResult(transcriptId: string): Promise<TranscriptionResult> {
  try {
    const transcript = await client.transcripts.get(transcriptId)
    
    const result: TranscriptionResult = {
      id: transcript.id,
      status: transcript.status as any,
      text: transcript.text || undefined,
      confidence: transcript.confidence || undefined,
      audioUrl: transcript.audio_url,
      error: transcript.error || undefined,
    }

    // Add word-level timestamps if available
    if (transcript.words) {
      result.words = transcript.words.map(word => ({
        text: word.text,
        start: word.start,
        end: word.end,
        confidence: word.confidence,
        speaker: word.speaker || undefined,
      }))
    }

    // Add speaker information if available
    if (transcript.speaker_labels && transcript.utterances) {
      const speakers = new Map<string, number>()
      transcript.utterances.forEach(utterance => {
        const speaker = utterance.speaker
        speakers.set(speaker, (speakers.get(speaker) || 0) + 1)
      })
      
      result.speakers = Array.from(speakers.entries()).map(([speaker, count]) => ({
        speaker,
        count,
      }))
    }

    // Add chapters if available
    if (transcript.chapters) {
      result.chapters = transcript.chapters.map(chapter => ({
        gist: chapter.gist,
        headline: chapter.headline,
        summary: chapter.summary,
        start: chapter.start,
        end: chapter.end,
      }))
    }

    return result
  } catch (error) {
    console.error('Error getting transcription result:', error)
    throw new Error('Failed to get transcription result')
  }
}

// Wait for transcription completion
export async function waitForTranscription(
  transcriptId: string,
  pollInterval = 3000,
  maxWaitTime = 600000 // 10 minutes
): Promise<TranscriptionResult> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    const result = await getTranscriptionResult(transcriptId)
    
    if (result.status === 'completed' || result.status === 'error') {
      return result
    }
    
    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }
  
  throw new Error('Transcription timeout')
}

// Complete transcription workflow
export async function transcribeAudioFile(
  audioFile: File | Buffer,
  config: TranscriptionConfig = {}
): Promise<TranscriptionResult> {
  try {
    // Step 1: Upload audio file
    const audioUrl = await uploadAudioFile(audioFile)
    
    // Step 2: Submit transcription request
    const transcriptId = await submitTranscription(audioUrl, config)
    
    // Step 3: Wait for completion
    const result = await waitForTranscription(transcriptId)
    
    return result
  } catch (error) {
    console.error('Error in complete transcription workflow:', error)
    throw error
  }
}

// Real-time transcription (for streaming audio)
export async function startRealtimeTranscription() {
  // AssemblyAI real-time transcription setup
  // This is a placeholder for real-time functionality
  // Real implementation would use AssemblyAI WebSocket API
  const rt = null;

  return rt
}

// Utility functions
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
}

export function calculateAccuracy(words: TranscriptionResult['words']): number {
  if (!words || words.length === 0) return 0
  
  const totalConfidence = words.reduce((sum, word) => sum + (word.confidence || 0), 0)
  return Math.round((totalConfidence / words.length) * 100)
}

export function extractSpeakers(words: TranscriptionResult['words']): string[] {
  if (!words) return []
  
  const speakers = new Set<string>()
  words.forEach(word => {
    if (word.speaker) speakers.add(word.speaker)
  })
  
  return Array.from(speakers).sort()
}

// Generate SRT subtitle format
export function generateSRT(words: TranscriptionResult['words']): string {
  if (!words) return ''
  
  let srt = ''
  let index = 1
  let currentSegment = ''
  let segmentStart = 0
  let segmentEnd = 0
  const segmentDuration = 5000 // 5 seconds per segment

  words.forEach((word, i) => {
    if (i === 0) {
      segmentStart = word.start
      currentSegment = word.text
      segmentEnd = word.end
    } else if (word.start - segmentStart > segmentDuration || i === words.length - 1) {
      // End current segment
      const startTime = formatSRTTime(segmentStart)
      const endTime = formatSRTTime(segmentEnd)
      
      srt += `${index}\n${startTime} --> ${endTime}\n${currentSegment.trim()}\n\n`
      
      // Start new segment
      index++
      segmentStart = word.start
      currentSegment = word.text
      segmentEnd = word.end
    } else {
      currentSegment += ' ' + word.text
      segmentEnd = word.end
    }
  })

  return srt
}

function formatSRTTime(milliseconds: number): string {
  const totalSeconds = milliseconds / 1000
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const ms = Math.floor((totalSeconds % 1) * 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

export { client as assemblyAIClient }