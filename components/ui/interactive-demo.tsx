"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const InteractiveDemo = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Real transcription function using AssemblyAI API
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      // Debug logging
      console.log('Demo - Sending audio blob:', {
        type: audioBlob.type,
        size: audioBlob.size,
        name: 'recording.webm'
      });

      const response = await fetch('/api/demo-transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error; // Let the calling function handle the error
    }
  };

  // Audio level monitoring
  const monitorAudioLevel = (stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (analyserRef.current && isRecording) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        requestAnimationFrame(updateLevel);
      }
    };
    updateLevel();
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      
      // Clear previous chunks
      chunksRef.current = [];
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      setIsRecording(true);
      setRecordingTime(0);
      setTranscribedText('');
      
      // Start timer with 60 second limit for demo
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto-stop at 60 seconds for demo
          if (newTime >= 60) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
      
      // Monitor audio levels
      monitorAudioLevel(stream);
      
      // Collect audio data chunks
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorderRef.current.onstop = async () => {
        if (chunksRef.current.length > 0) {
          setIsProcessing(true);
          const audioBlob = new Blob(chunksRef.current, { 
            type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
          });
          
          try {
            const transcription = await transcribeAudio(audioBlob);
            setTranscribedText(transcription);
          } catch (err) {
            setError('Failed to transcribe audio. Please try again.');
            console.error('Transcription failed:', err);
          } finally {
            setIsProcessing(false);
          }
        }
      };
      
      mediaRecorderRef.current.start();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Please allow microphone access to use this demo.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const resetDemo = () => {
    stopRecording();
    setTranscribedText('');
    setRecordingTime(0);
    setIsProcessing(false);
    setError(null);
    chunksRef.current = [];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section id="demo-section" className="py-20 px-6 bg-transparent">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 data-testid="demo-heading" className="text-4xl md:text-5xl font-bold text-white mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Try our voice transcription technology right now. No sign-up required!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
        >
          {/* Recording Controls */}
          <div className="flex flex-col items-center mb-8">
            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "relative w-24 h-24 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 mb-4",
                isRecording 
                  ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30" 
                  : "bg-gray-700 hover:bg-gray-800 shadow-lg shadow-gray-700/30"
              )}
              whileTap={{ scale: 0.95 }}
            >
              {isRecording ? (
                <Square className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
              
              {/* Pulsing animation for recording */}
              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-red-400"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ 
                    scale: [1, 1.5, 1], 
                    opacity: [1, 0, 1] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
              )}
            </motion.button>
            
            <p className="text-gray-400 text-lg mb-2">
              {isRecording ? "Recording... Click to stop" : "Click to start recording"}
            </p>
            
            {recordingTime > 0 && (
              <div className="text-center">
                <p className={cn(
                  "font-mono text-xl mb-1",
                  recordingTime >= 50 ? "text-red-400" : "text-white"
                )}>
                  {formatTime(recordingTime)}
                </p>
                <p className="text-gray-400 text-sm">
                  {recordingTime >= 50 ? "Demo limit reached soon" : "Demo limit: 1 minute"}
                </p>
              </div>
            )}
          </div>

          {/* Waveform Visualization */}
          <div className="mb-8 h-20 flex items-center justify-center">
            <div className="flex items-end space-x-1 h-full">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-gray-600 w-2 rounded-full"
                  style={{ 
                    height: isRecording 
                      ? Math.max(4, audioLevel * 60 + Math.random() * 20)
                      : 4
                  }}
                  animate={{
                    height: isRecording 
                      ? [4, Math.max(4, audioLevel * 60 + Math.random() * 20), 4]
                      : 4
                  }}
                  transition={{ 
                    duration: 0.3, 
                    repeat: isRecording ? Infinity : 0,
                    delay: i * 0.05
                  }}
                />
              ))}
            </div>
          </div>

          {/* Transcription Output */}
          <div className="min-h-[120px] bg-transparent/50 rounded-xl p-6 border border-gray-600">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4"
                >
                  <div className="flex items-center gap-2 text-red-400">
                    <X className="h-5 w-5" />
                    <span className="text-sm font-medium">Error</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </motion.div>
              )}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="flex items-center gap-3 text-white">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RotateCcw className="h-6 w-6" />
                    </motion.div>
                    <span className="text-lg">Processing your audio with AI...</span>
                  </div>
                </motion.div>
              )}
              
              {transcribedText && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h4 className="text-gray-400 text-sm mb-3 text-left">
                    ✨ Transcribed Text:
                  </h4>
                  <motion.p 
                    className="text-white text-lg leading-relaxed text-left"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                  >
                    {transcribedText}
                  </motion.p>
                </motion.div>
              )}
              
              {!transcribedText && !isProcessing && !error && (
                <p className="text-gray-500 text-center py-8">
                  🎤 Your transcribed text will appear here...
                </p>
              )}
            </AnimatePresence>
          </div>

          {/* Reset Button */}
          {transcribedText && (
            <motion.button
              onClick={resetDemo}
              className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </motion.button>
          )}
        </motion.div>


        {/* Demo Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center"
        >
          <div className="p-4">
            <div className="text-white text-3xl mb-2">⚡</div>
            <h4 className="text-white font-semibold mb-2">Real-time Processing</h4>
            <p className="text-gray-400 text-sm">See your words appear as you speak</p>
          </div>
          <div className="p-4">
            <div className="text-white text-3xl mb-2">🎯</div>
            <h4 className="text-white font-semibold mb-2">99%+ Accuracy</h4>
            <p className="text-gray-400 text-sm">Industry-leading precision powered by AssemblyAI</p>
          </div>
          <div className="p-4">
            <div className="text-white text-3xl mb-2">🔒</div>
            <h4 className="text-white font-semibold mb-2">Private & Secure</h4>
            <p className="text-gray-400 text-sm">Your voice data stays safe</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};