import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadAudioFile } from '@/lib/storage';
import { createTranscription } from '@/lib/database';

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

    // Ensure user profile exists (required for RLS policies)
    const { getProfile, createProfile } = await import('@/lib/database');
    let profile = await getProfile(session.user.id);
    
    if (!profile) {
      console.log('Upload API - Creating user profile');
      profile = await createProfile({
        id: session.user.id,
        name: session.user.name || session.user.email || 'User',
        email: session.user.email!,
        avatar_url: session.user.image || null
      });
      
      if (!profile) {
        console.error('Upload API - Failed to create user profile');
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }
    }

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

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      );
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

    // Create transcription record first
    const transcriptionTitle = title || file.name.replace(/\.[^/.]+$/, '') || 'Untitled';
    console.log('Upload API - Creating transcription record for:', transcriptionTitle);
    
    let transcriptionRecord;
    try {
      transcriptionRecord = await createTranscription({
        title: transcriptionTitle,
        file_name: file.name,
        file_size: file.size,
        user_id: session.user.id,
        project_id: projectId,
        status: 'uploading',
        language: 'en'
      });
      console.log('Upload API - Transcription record created:', transcriptionRecord?.id);
    } catch (dbError) {
      console.error('Upload API - Database error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please check your Supabase configuration.' },
        { status: 500 }
      );
    }

    if (!transcriptionRecord) {
      console.log('Upload API - No transcription record returned');
      return NextResponse.json(
        { error: 'Failed to create transcription record' },
        { status: 500 }
      );
    }

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
        { error: `Failed to upload file to storage: ${uploadError.message}` },
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