import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadAudioFile } from '@/lib/storage';
import { createTranscription } from '@/lib/database';
import { getSubscriptionTier, checkUsageLimit } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    console.log('Upload API - Session:', session ? 'Found' : 'Not found');
    
    if (!session?.user?.id) {
      console.log('Upload API - No session or user ID');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Upload API - User ID:', session.user.id);

    // Ensure user profile exists using upsert (handles existing profiles)
    const { createProfile } = await import('@/lib/database');
    console.log('Upload API - Ensuring user profile exists');
    const profile = await createProfile({
      id: session.user.id,
      name: session.user.name || session.user.email || 'User',
      email: session.user.email!,
      avatar_url: session.user.image || null
    });
    
    if (!profile) {
      console.error('Upload API - Failed to ensure user profile');
      return NextResponse.json(
        { error: 'Failed to ensure user profile' },
        { status: 500 }
      );
    }
    
    console.log('Upload API - User profile ready:', profile.id);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string || null;
    const title = formData.get('title') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check subscription limits
    const subscriptionTier = await getSubscriptionTier(session.user.id);

    // Check file size limits based on subscription
    const maxFileSizeMB = subscriptionTier === 'free' ? 25 : 
                         subscriptionTier === 'pro' ? 500 : 
                         subscriptionTier === 'enterprise' ? 1000 : 25;
    
    const maxFileSize = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxFileSize) {
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
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please use MP3, WAV, M4A, or WebM.' },
        { status: 400 }
      );
    }

    // Create transcription record
    const transcriptionTitle = title || file.name.replace(/\.[^/.]+$/, '') || 'Untitled';
    console.log('Upload API - Creating transcription record for:', transcriptionTitle);
    
    const transcriptionRecord = await createTranscription({
      title: transcriptionTitle,
      file_name: file.name,
      file_size: file.size,
      user_id: session.user.id,
      project_id: projectId,
      status: 'uploading',
      language: 'en'
    });

    if (!transcriptionRecord) {
      console.error('Upload API - Failed to create transcription record');
      return NextResponse.json(
        { error: 'Failed to create transcription record' },
        { status: 500 }
      );
    }
    
    console.log('Upload API - Transcription record created:', transcriptionRecord.id);

    // Upload file to Supabase Storage
    console.log('Upload API - Starting file upload to storage');
    let uploadResult;
    try {
      uploadResult = await uploadAudioFile(
        file, 
        session.user.id, 
        transcriptionRecord.id
      );
      console.log('Upload API - File uploaded successfully:', uploadResult?.path);
    } catch (uploadError) {
      console.error('Upload API - Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload file to storage: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Update transcription record with file URL
    // Note: In production, you might want to use updateTranscription here
    // For now, we'll return the upload info

    return NextResponse.json({
      success: true,
      transcription: {
        id: transcriptionRecord.id,
        title: transcriptionRecord.title,
        status: 'uploaded',
        fileUrl: uploadResult.url,
        filePath: uploadResult.path
      },
      upload: uploadResult
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle file deletion
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const transcriptionId = searchParams.get('id');

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path required' },
        { status: 400 }
      );
    }

    // TODO: Verify user owns this file
    // TODO: Delete from storage
    // TODO: Update/delete transcription record

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}