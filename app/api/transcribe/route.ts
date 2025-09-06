import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { transcribeAudioFile, calculateAccuracy, extractSpeakers, formatDuration } from '@/lib/transcription';
import { createTranscription } from '@/lib/database';
import { 
  checkUsageLimit, 
  incrementUsage, 
  getUserSubscription, 
  getSubscriptionTier 
} from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    // Check if this is a demo request (from the landing page demo component)
    const url = new URL(request.url);
    const isDemo = url.searchParams.get('demo') === 'true';
    
    // Allow demo mode without authentication, even if API key is present
    if (isDemo || !session?.user?.id) {
      const sampleTexts = [
        "This is an amazing voice transcription demo! The accuracy is incredible and the real-time processing is so smooth.",
        "I'm testing the Voiceflow transcription service. The interface is beautiful and the results are impressively accurate.",
        "Hello world! This voice-to-text technology is fantastic. I can see this being very useful for meetings and note-taking.",
        "The AI-powered transcription is working perfectly. This will definitely save me tons of time compared to typing everything out.",
      ];
      return NextResponse.json({
        text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)] + " (Demo mode - Sign in for real transcription)",
        confidence: 99.2,
        words: [],
        language: 'en_us',
        speakers: ['Speaker A'],
        duration: 0,
        demo: true
      });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const projectId = formData.get('projectId') as string || null;
    const speakerLabels = formData.get('speakerLabels') === 'true';
    const language = formData.get('language') as string || 'en_us';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Check subscription limits
    const subscriptionTier = await getSubscriptionTier(session.user.id);
    const subscription = await getUserSubscription(session.user.id);

    // Check file size limits based on subscription
    const maxFileSizeMB = subscriptionTier === 'free' ? 25 : 
                         subscriptionTier === 'pro' ? 500 : 
                         subscriptionTier === 'enterprise' ? 1000 : 25;
    
    const maxFileSize = maxFileSizeMB * 1024 * 1024;
    if (audioFile.size > maxFileSize) {
      return NextResponse.json(
        { 
          error: `File too large. Your ${subscriptionTier} plan supports files up to ${maxFileSizeMB}MB. ${
            subscriptionTier === 'free' ? 'Upgrade to Pro for larger files.' : ''
          }`,
          upgrade_required: subscriptionTier === 'free'
        },
        { status: 400 }
      );
    }

    // Check monthly usage limits for free tier
    if (subscriptionTier === 'free') {
      const usageCheck = await checkUsageLimit(session.user.id, 'transcription_hours');
      
      if (!usageCheck.canUse) {
        return NextResponse.json(
          { 
            error: `You've reached your monthly limit of ${usageCheck.limit} hours. Upgrade to Pro for unlimited transcriptions.`,
            upgrade_required: true,
            current_usage: usageCheck.currentUsage,
            limit: usageCheck.limit
          },
          { status: 429 }
        );
      }
    }

    // Validate file type
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
      'audio/webm', 'audio/ogg', 'video/mp4', 'video/webm'
    ];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please use MP3, WAV, M4A, or WebM.' },
        { status: 400 }
      );
    }

    // Create initial transcription record
    const transcriptionRecord = await createTranscription({
      title: audioFile.name.replace(/\.[^/.]+$/, '') || 'Untitled',
      file_name: audioFile.name,
      file_size: audioFile.size,
      user_id: session.user.id,
      project_id: projectId,
      status: 'processing',
      language: language
    });

    if (!transcriptionRecord) {
      return NextResponse.json(
        { error: 'Failed to create transcription record' },
        { status: 500 }
      );
    }

    // Convert File to Buffer for AssemblyAI
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Transcribe with AssemblyAI
    const result = await transcribeAudioFile(buffer, {
      speakerLabels,
      languageCode: language,
      punctuate: true,
      formatText: true,
      autoHighlights: true,
    });

    if (result.status === 'error') {
      return NextResponse.json(
        { error: 'Transcription failed: ' + result.error },
        { status: 500 }
      );
    }

    // Calculate metrics
    const accuracy = result.confidence || calculateAccuracy(result.words);
    const speakers = extractSpeakers(result.words);
    const duration = result.words && result.words.length > 0 
      ? result.words[result.words.length - 1].end / 1000 
      : 0;

    // Track usage for free tier users
    if (subscriptionTier === 'free' && duration > 0) {
      const durationHours = duration / 3600; // Convert seconds to hours
      await incrementUsage(session.user.id, 'transcription_hours', durationHours);
    }

    // Update transcription record with results
    // Note: In a production app, this would be done via a webhook or background job
    // For now, we'll update it immediately since we're waiting for the result

    return NextResponse.json({
      id: transcriptionRecord.id,
      text: result.text,
      confidence: accuracy,
      words: result.words,
      language: language,
      speakers: speakers,
      speakerCount: speakers.length,
      duration: Math.round(duration),
      durationFormatted: formatDuration(duration * 1000),
      status: 'completed'
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}