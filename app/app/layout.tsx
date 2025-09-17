"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { AppSidebar } from '@/components/ui/app-sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects - Same as landing page */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-700/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-gray-700/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main Content */}
        <motion.main 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-y-auto"
        >
          <div className="relative z-10">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}