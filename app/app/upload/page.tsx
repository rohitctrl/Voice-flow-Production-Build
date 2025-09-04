"use client";
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Upload as UploadIcon, 
  Mic, 
  File, 
  X, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle,
  Clock,
  FileAudio,
  FolderPlus,
  Settings,
  Zap,
  Users,
  Globe,
  Shield,
  RotateCcw,
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  duration?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  transcription?: string;
  accuracy?: number;
  speakers?: number;
  project?: string;
  error?: string;
}

const UploadPage = () => {
  const { data: session } = useSession();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedProject, setSelectedProject] = useState('');
  const [transcriptionSettings, setTranscriptionSettings] = useState({
    language: 'en',
    speakerDiarization: true,
    timestamps: true,
    punctuation: true,
    profanityFilter: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimeRef = useRef<NodeJS.Timeout | null>(null);

  const projects = [
    'Product Team Meetings',
    'Customer Interviews', 
    'Content Creation',
    'Legal Documentation',
    'Training Sessions'
  ];

  const supportedFormats = [
    'MP3', 'WAV', 'M4A', 'FLAC', 'OGG', 'WMA', 'AAC', 'MP4', 'MOV', 'AVI', 'MKV'
  ];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const extension = file.name.split('.').pop()?.toUpperCase();
      return extension && supportedFormats.includes(extension);
    });

    const newFiles: UploadFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
      project: selectedProject
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
    
    // Upload and process real files
    newFiles.forEach(uploadFile => {
      processFile(uploadFile);
    });
  };

  const processFile = async (uploadFile: UploadFile) => {
    if (!session?.user?.id) {
      setUploadFiles(prev => prev.map(file => 
        file.id === uploadFile.id 
          ? { ...file, status: 'error', error: 'Please sign in to upload files' }
          : file
      ));
      return;
    }

    try {
      // Step 1: Upload file
      setUploadFiles(prev => prev.map(file => 
        file.id === uploadFile.id 
          ? { ...file, status: 'uploading', progress: 0 }
          : file
      ));

      const formData = new FormData();
      formData.append('file', uploadFile.file);
      if (selectedProject) {
        formData.append('projectId', selectedProject);
      }
      formData.append('title', uploadFile.name.replace(/\.[^/.]+$/, ''));

      // Simulate upload progress
      const uploadProgressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(file => 
          file.id === uploadFile.id 
            ? { ...file, progress: Math.min(file.progress + Math.random() * 10, 90) }
            : file
        ));
      }, 200);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(uploadProgressInterval);

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();

      // Step 2: Transcribe file
      setUploadFiles(prev => prev.map(file => 
        file.id === uploadFile.id 
          ? { ...file, status: 'processing', progress: 0 }
          : file
      ));

      const transcribeFormData = new FormData();
      transcribeFormData.append('audio', uploadFile.file);
      if (selectedProject) {
        transcribeFormData.append('projectId', selectedProject);
      }
      transcribeFormData.append('speakerLabels', transcriptionSettings.speakerDiarization.toString());
      transcribeFormData.append('language', transcriptionSettings.language);

      // Simulate transcription progress
      const transcribeProgressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(file => 
          file.id === uploadFile.id 
            ? { ...file, progress: Math.min(file.progress + Math.random() * 5, 95) }
            : file
        ));
      }, 500);

      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: transcribeFormData,
      });

      clearInterval(transcribeProgressInterval);

      if (!transcribeResponse.ok) {
        throw new Error(`Transcription failed: ${transcribeResponse.statusText}`);
      }

      const transcribeResult = await transcribeResponse.json();

      // Complete
      setUploadFiles(prev => prev.map(file => 
        file.id === uploadFile.id 
          ? { 
              ...file, 
              status: 'completed', 
              progress: 100,
              transcription: transcribeResult.text,
              accuracy: transcribeResult.confidence,
              speakers: transcribeResult.speakerCount || transcribeResult.speakers?.length || 1,
              duration: transcribeResult.durationFormatted || 'Unknown'
            }
          : file
      ));

    } catch (error) {
      console.error('File processing error:', error);
      setUploadFiles(prev => prev.map(file => 
        file.id === uploadFile.id 
          ? { 
              ...file, 
              status: 'error', 
              error: error.message || 'Failed to process file'
            }
          : file
      ));
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingTimeRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingTimeRef.current) {
      clearInterval(recordingTimeRef.current);
    }
    
    // Create a mock recorded file
    const mockFile = new File([''], `Recording_${Date.now()}.wav`, { type: 'audio/wav' });
    handleFiles([mockFile]);
    setRecordingTime(0);
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <RotateCcw className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'text-blue-400 bg-blue-400/10';
      case 'processing': return 'text-yellow-400 bg-yellow-400/10';
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'error': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
          Upload & Transcribe 🎤
        </h1>
        <p className="text-gray-400 text-lg">
          Upload audio files or record directly to get instant AI transcriptions
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Methods */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-xl font-bold text-white mb-6">Upload Methods</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Upload */}
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group",
                  isDragOver 
                    ? "border-white/50 bg-white/5" 
                    : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/30"
                )}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*,video/*"
                  className="hidden"
                  onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                />
                
                <UploadIcon className="h-12 w-12 text-gray-400 group-hover:text-white mx-auto mb-4 transition-colors duration-200" />
                <h3 className="text-white font-semibold mb-2">Upload Files</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Drop files here or click to browse
                </p>
                <div className="text-xs text-gray-500">
                  Supports: {supportedFormats.slice(0, 5).join(', ')} + more
                </div>
              </div>

              {/* Record Audio */}
              <div className="border-2 border-gray-600 rounded-xl p-8 text-center hover:border-gray-500 hover:bg-gray-800/30 transition-all duration-300">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300",
                    isRecording 
                      ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30" 
                      : "bg-gray-700 hover:bg-gray-600"
                  )}
                >
                  <Mic className="h-8 w-8 text-white" />
                </button>
                
                <h3 className="text-white font-semibold mb-2">Record Audio</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {isRecording ? `Recording... ${formatTime(recordingTime)}` : 'Click to start recording'}
                </p>
                
                {isRecording && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center space-x-1"
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-red-400 rounded-full"
                        animate={{
                          height: [8, 24, 8],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Upload Queue */}
          {uploadFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload Queue</h2>
                <div className="text-sm text-gray-400">
                  {uploadFiles.length} file{uploadFiles.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {uploadFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-black/30 rounded-xl p-4 border border-gray-700/30"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <FileAudio className="h-8 w-8 text-gray-400" />
                          <div>
                            <h4 className="text-white font-medium">{file.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{formatFileSize(file.size)}</span>
                              {file.duration && <span>{file.duration}</span>}
                              {file.project && <span>Project: {file.project}</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1",
                            getStatusColor(file.status)
                          )}>
                            {getStatusIcon(file.status)}
                            {file.status}
                          </div>
                          
                          <button 
                            onClick={() => removeFile(file.id)}
                            className="p-1 hover:bg-gray-700/50 rounded text-gray-400 hover:text-red-400"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {file.status !== 'completed' && file.status !== 'error' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                            <span>
                              {file.status === 'uploading' ? 'Uploading...' : 'Processing with AI...'}
                            </span>
                            <span>{Math.round(file.progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Transcription Result */}
                      {file.status === 'completed' && file.transcription && (
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-white font-medium text-sm">Transcription Result</h5>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              {file.accuracy && <span>Accuracy: {file.accuracy}%</span>}
                              {file.speakers && <span>Speakers: {file.speakers}</span>}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed mb-3">
                            {file.transcription}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs transition-colors duration-200">
                              <Eye className="h-3 w-3" />
                              View Full
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs transition-colors duration-200">
                              <Download className="h-3 w-3" />
                              Export
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Error State */}
                      {file.status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>Processing failed</span>
                          </div>
                          {file.error && (
                            <p className="text-red-300 text-xs mt-1">{file.error}</p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* Project Selection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-bold text-white mb-4">Project Assignment</h3>
            
            <div className="space-y-3">
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:border-gray-600/50 focus:outline-none"
              >
                <option value="">No Project</option>
                {projects.map((project, index) => (
                  <option key={index} value={project}>{project}</option>
                ))}
              </select>
              
              <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                <FolderPlus className="h-4 w-4" />
                Create New Project
              </button>
            </div>
          </motion.div>

          {/* Transcription Settings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-bold text-white mb-4">Transcription Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Language</label>
                <select 
                  value={transcriptionSettings.language}
                  onChange={(e) => setTranscriptionSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:border-gray-600/50 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                </select>
              </div>
              
              <div className="space-y-3">
                {[
                  { key: 'speakerDiarization', label: 'Speaker Identification', icon: Users },
                  { key: 'timestamps', label: 'Timestamps', icon: Clock },
                  { key: 'punctuation', label: 'Smart Punctuation', icon: Zap },
                  { key: 'profanityFilter', label: 'Profanity Filter', icon: Shield }
                ].map((setting, index) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <setting.icon className="h-4 w-4 text-gray-400" />
                      <span className="text-white text-sm">{setting.label}</span>
                    </div>
                    <button
                      onClick={() => setTranscriptionSettings(prev => ({
                        ...prev,
                        [setting.key]: !prev[setting.key as keyof typeof prev]
                      }))}
                      className={cn(
                        "w-10 h-6 rounded-full transition-all duration-200 relative",
                        transcriptionSettings[setting.key as keyof typeof transcriptionSettings]
                          ? "bg-purple-500"
                          : "bg-gray-600"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200",
                        transcriptionSettings[setting.key as keyof typeof transcriptionSettings]
                          ? "left-5"
                          : "left-1"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-bold text-white mb-4">💡 Pro Tips</h3>
            
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>Clear audio with minimal background noise yields best results</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>Files up to 2GB and 4 hours duration are supported</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>Multiple file formats supported for maximum flexibility</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;