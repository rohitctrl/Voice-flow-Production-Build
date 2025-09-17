import type { Metadata } from 'next'
import './globals.css'
import SessionProviderWrapper from '@/components/providers/session-provider'

export const metadata: Metadata = {
  title: 'Voiceflow - AI-Powered Voice Transcription',
  description: 'Transform your voice into beautifully organized text with the power of AI. Capture ideas, create content, and boost productivity with seamless voice transcription.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black" suppressHydrationWarning>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  )
}