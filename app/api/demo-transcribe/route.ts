import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Log file details for debugging
    console.log('Demo API - File details:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // Validate file size (max 10MB for demo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large for demo. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // For demo, be very permissive with file types
    // Many browsers might send different MIME types for recorded audio
    const isLikelyAudioFile = 
      !audioFile.type || // Empty type from some browsers
      audioFile.type === '' || 
      audioFile.type.startsWith('audio/') || 
      audioFile.type.startsWith('video/') || // Some browsers use video/ for webm
      audioFile.name.match(/\.(mp3|wav|m4a|webm|ogg|mp4)$/i) ||
      audioFile.size > 1000; // If it has substantial size, likely audio
    
    if (!isLikelyAudioFile && audioFile.size < 100) {
      console.log('Demo API - File rejected (too small or invalid):', {
        type: audioFile.type,
        size: audioFile.size,
        name: audioFile.name
      });
      return NextResponse.json(
        { error: 'Invalid audio file. Please try recording again.' },
        { status: 400 }
      );
    }

    // If AssemblyAI API key is available, use real transcription for demo
    if (process.env.ASSEMBLYAI_API_KEY) {
      try {
        // Convert File to Buffer for AssemblyAI
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use AssemblyAI for real demo transcription
        const { transcribeAudioFile } = await import('@/lib/transcription');
        const result = await transcribeAudioFile(buffer, {
          speakerLabels: false,
          languageCode: 'en_us',
          punctuate: true,
          formatText: true,
          autoHighlights: false,
        });

        if (result.status === 'error') {
          throw new Error(result.error);
        }

        // Calculate duration from audio file if available
        const duration = result.words && result.words.length > 0 
          ? result.words[result.words.length - 1].end / 1000 
          : 0;

        return NextResponse.json({
          text: result.text,
          confidence: result.confidence || 95,
          duration: Math.round(duration),
          demo: false, // Real transcription
          message: "This is a real transcription powered by AssemblyAI. Sign up to save and manage your transcriptions!"
        });

      } catch (error) {
        console.error('Demo transcription error:', error);
        // Fall back to mock response if real transcription fails
      }
    }

    // Fallback demo responses (if no API key or if real transcription fails)
    const sampleTexts = [
      "Welcome to Voiceflow! This is a demonstration of our AI-powered transcription technology. The accuracy you're seeing here represents what you can expect from our real-time voice processing system.",
      "Hello and thank you for trying our demo! This transcription was generated to show you the quality and speed of our voice recognition technology. Sign up to start transcribing your own audio files.",
      "This is an example of how our transcription service works. In real usage, your audio would be processed with industry-leading accuracy and returned as searchable, editable text like this.",
      "Great job testing our demo! This sample transcription demonstrates the clarity and precision you can expect. Our AI processes speech with remarkable accuracy for meetings, interviews, and note-taking.",
      "You're experiencing our voice-to-text technology in action! This demonstration text shows how we convert speech into accurate, formatted transcriptions that you can edit, search, and export."
    ];

    // Simulate processing time for realism
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

    return NextResponse.json({
      text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
      confidence: 96 + Math.random() * 3, // Random confidence between 96-99%
      duration: 15 + Math.floor(Math.random() * 45), // Random duration 15-60 seconds
      demo: true,
      message: "This is a demo transcription. Sign up to transcribe your actual audio with AI!"
    });

  } catch (error) {
    console.error('Demo transcription error:', error);
    return NextResponse.json(
      { error: 'Demo transcription failed. Please try again.' },
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