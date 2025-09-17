"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';

export const FloatingRecordButton = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 200px from top
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRecordClick = () => {
    if (isRecording) {
      setIsRecording(false);
      // Stop recording logic here
    } else {
      setIsRecording(true);
      // Start recording logic here
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRecordClick}
            className={`
              relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300
              flex items-center justify-center font-bold text-white
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
                : 'bg-gray-700 hover:bg-gray-800 shadow-gray-700/30'
              }
            `}
          >
            {/* Pulsing animation when recording */}
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500"
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            
            {/* Button content */}
            <motion.div
              animate={{ rotate: isRecording ? 0 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isRecording ? (
                <Square className="h-6 w-6" fill="currentColor" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </motion.div>
          </motion.button>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-2 bg-black/80 backdrop-blur-sm text-white text-sm rounded-lg whitespace-nowrap"
          >
            {isRecording ? 'Stop Recording' : 'Quick Record'}
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-black/80"></div>
          </motion.div>

          {/* Recording indicator dot */}
          {isRecording && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};