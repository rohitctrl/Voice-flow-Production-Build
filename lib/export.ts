import { formatDuration, generateSRT } from './transcription'
import type { Database } from './supabase'

type Transcription = Database['public']['Tables']['transcriptions']['Row']
type Project = Database['public']['Tables']['projects']['Row']

export interface ExportOptions {
  format: 'txt' | 'srt' | 'docx' | 'pdf'
  includeTimestamps?: boolean
  includeSpeakers?: boolean
  includeMetadata?: boolean
}

// Export single transcription as TXT
export function exportTranscriptionAsTXT(
  transcription: Transcription,
  options: ExportOptions = { format: 'txt' }
): Blob {
  let content = ''
  
  // Add metadata if requested
  if (options.includeMetadata) {
    content += `Title: ${transcription.title}\n`
    content += `File: ${transcription.file_name}\n`
    content += `Duration: ${formatDuration(transcription.duration || 0)}\n`
    content += `Created: ${new Date(transcription.created_at).toLocaleString()}\n`
    if (transcription.accuracy) {
      content += `Accuracy: ${transcription.accuracy}%\n`
    }
    content += `\n---\n\n`
  }
  
  // Add main content
  content += transcription.content || 'No transcription content available.'
  
  return new Blob([content], { type: 'text/plain;charset=utf-8' })
}

// Export transcription as SRT (subtitle format)
export function exportTranscriptionAsSRT(transcription: Transcription): Blob {
  let content = ''
  
  try {
    // Parse words data if available
    const words = (transcription as any).words ? JSON.parse((transcription as any).words) : null
    
    if (words && Array.isArray(words)) {
      content = generateSRT(words)
    } else {
      // Fallback: create simple SRT from content
      content = `1\n00:00:00,000 --> ${formatSRTDuration(transcription.duration || 30000)}\n${transcription.content || 'No transcription content'}\n\n`
    }
  } catch (error) {
    // Fallback for parsing errors
    content = `1\n00:00:00,000 --> ${formatSRTDuration(transcription.duration || 30000)}\n${transcription.content || 'No transcription content'}\n\n`
  }
  
  return new Blob([content], { type: 'text/srt;charset=utf-8' })
}

// Export transcription as DOCX (simplified HTML for Word)
export function exportTranscriptionAsDOCX(
  transcription: Transcription,
  options: ExportOptions = { format: 'docx' }
): Blob {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${transcription.title}</title>
  <style>
    body { font-family: 'Times New Roman', serif; margin: 1in; line-height: 1.6; }
    .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
    .title { font-size: 24px; font-weight: bold; color: #333; }
    .metadata { font-size: 12px; color: #666; margin-top: 10px; }
    .content { font-size: 14px; text-align: justify; }
    .timestamp { color: #999; font-size: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${transcription.title}</div>
    <div class="metadata">
      <strong>File:</strong> ${transcription.file_name}<br>
      <strong>Duration:</strong> ${formatDuration(transcription.duration || 0)}<br>
      <strong>Created:</strong> ${new Date(transcription.created_at).toLocaleString()}<br>
      ${transcription.accuracy ? `<strong>Accuracy:</strong> ${transcription.accuracy}%<br>` : ''}
    </div>
  </div>
  <div class="content">
    ${(transcription.content || 'No transcription content available.').replace(/\n/g, '<br>')}
  </div>
</body>
</html>`
  
  return new Blob([html], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}

// Export transcription as PDF (HTML with print styles)
export function exportTranscriptionAsPDF(
  transcription: Transcription,
  options: ExportOptions = { format: 'pdf' }
): Blob {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${transcription.title}</title>
  <style>
    @page { size: A4; margin: 1in; }
    body { 
      font-family: 'Arial', sans-serif; 
      margin: 0; 
      line-height: 1.5; 
      font-size: 12px;
      color: #333;
    }
    .header { 
      border-bottom: 2px solid #000; 
      padding-bottom: 15px; 
      margin-bottom: 20px; 
    }
    .title { 
      font-size: 20px; 
      font-weight: bold; 
      color: #000; 
      margin-bottom: 10px;
    }
    .metadata { 
      font-size: 10px; 
      color: #666; 
      line-height: 1.3;
    }
    .content { 
      font-size: 11px; 
      text-align: justify; 
      line-height: 1.4;
    }
    .footer {
      position: fixed;
      bottom: 0.5in;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 8px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${transcription.title}</div>
    <div class="metadata">
      <strong>File:</strong> ${transcription.file_name} | 
      <strong>Duration:</strong> ${formatDuration(transcription.duration || 0)} | 
      <strong>Created:</strong> ${new Date(transcription.created_at).toLocaleDateString()}
      ${transcription.accuracy ? ` | <strong>Accuracy:</strong> ${transcription.accuracy}%` : ''}
    </div>
  </div>
  <div class="content">
    ${(transcription.content || 'No transcription content available.').replace(/\n/g, '<br>')}
  </div>
  <div class="footer">
    Generated by Voiceflow - ${new Date().toLocaleString()}
  </div>
</body>
</html>`
  
  return new Blob([html], { type: 'text/html' })
}

// Bulk export multiple transcriptions
export function exportMultipleTranscriptions(
  transcriptions: Transcription[],
  format: ExportOptions['format']
): Blob {
  if (format === 'txt') {
    let content = `Voiceflow Transcriptions Export\nGenerated: ${new Date().toLocaleString()}\n\n`
    content += '='.repeat(50) + '\n\n'
    
    transcriptions.forEach((t, index) => {
      content += `${index + 1}. ${t.title}\n`
      content += `   File: ${t.file_name}\n`
      content += `   Duration: ${formatDuration(t.duration || 0)}\n`
      content += `   Created: ${new Date(t.created_at).toLocaleString()}\n`
      if (t.accuracy) content += `   Accuracy: ${t.accuracy}%\n`
      content += '\n'
      content += t.content || 'No content available.'
      content += '\n\n' + '-'.repeat(30) + '\n\n'
    })
    
    return new Blob([content], { type: 'text/plain;charset=utf-8' })
  }
  
  // For other formats, create a ZIP-like structure (simplified)
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Voiceflow Transcriptions Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
    .export-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .transcription { margin-bottom: 40px; page-break-before: always; }
    .transcription:first-of-type { page-break-before: auto; }
    .title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; }
    .metadata { font-size: 12px; color: #666; margin-bottom: 15px; }
    .content { font-size: 14px; }
  </style>
</head>
<body>
  <div class="export-header">
    <h1>Voiceflow Transcriptions Export</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Total Transcriptions: ${transcriptions.length}</p>
  </div>
  
  ${transcriptions.map((t, index) => `
    <div class="transcription">
      <div class="title">${index + 1}. ${t.title}</div>
      <div class="metadata">
        <strong>File:</strong> ${t.file_name} | 
        <strong>Duration:</strong> ${formatDuration(t.duration || 0)} | 
        <strong>Created:</strong> ${new Date(t.created_at).toLocaleString()}
        ${t.accuracy ? ` | <strong>Accuracy:</strong> ${t.accuracy}%` : ''}
      </div>
      <div class="content">
        ${(t.content || 'No content available.').replace(/\n/g, '<br>')}
      </div>
    </div>
  `).join('')}
</body>
</html>`
  
  const mimeType = format === 'docx' 
    ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    : 'text/html'
  
  return new Blob([html], { type: mimeType })
}

// Export project summary
export function exportProjectSummary(
  project: Project & { transcriptions?: Transcription[] }
): Blob {
  let content = `Project Summary: ${project.name}\n`
  content += `Generated: ${new Date().toLocaleString()}\n\n`
  content += '='.repeat(50) + '\n\n'
  
  content += `Description: ${project.description || 'No description'}\n`
  content += `Created: ${new Date(project.created_at).toLocaleString()}\n`
  content += `Last Updated: ${new Date(project.updated_at).toLocaleString()}\n\n`
  
  if (project.transcriptions && project.transcriptions.length > 0) {
    content += `Transcriptions (${project.transcriptions.length}):\n`
    content += '-'.repeat(30) + '\n'
    
    project.transcriptions.forEach((t, index) => {
      content += `${index + 1}. ${t.title}\n`
      content += `   Duration: ${formatDuration(t.duration || 0)}\n`
      content += `   Status: ${t.status}\n`
      if (t.accuracy) content += `   Accuracy: ${t.accuracy}%\n`
      content += `   Created: ${new Date(t.created_at).toLocaleString()}\n\n`
    })
  } else {
    content += 'No transcriptions in this project.\n'
  }
  
  return new Blob([content], { type: 'text/plain;charset=utf-8' })
}

// Utility function to trigger download
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Helper function to format SRT duration
function formatSRTDuration(milliseconds: number): string {
  const totalSeconds = milliseconds / 1000
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const ms = Math.floor((totalSeconds % 1) * 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

// Generate filename with timestamp
export function generateExportFilename(
  name: string, 
  format: string, 
  includeDate = true
): string {
  const cleanName = name.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_')
  const timestamp = includeDate ? `_${new Date().toISOString().split('T')[0]}` : ''
  return `${cleanName}${timestamp}.${format}`
}