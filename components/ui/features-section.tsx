"use client";
import React from "react";
import { motion } from "framer-motion";
import RadialOrbitalTimeline from "./radial-orbital-timeline";
import { Mic, FileText, Zap, Brain, Shield, Globe } from "lucide-react";

export const FeaturesSection = () => {
  const timelineData = [
    {
      id: 1,
      title: "Real-time Transcription",
      date: "Instant",
      content: "Convert speech to text instantly with industry-leading accuracy. Perfect for meetings, interviews, and content creation.",
      category: "Core Feature",
      icon: Mic,
      relatedIds: [2, 4],
      status: "completed" as const,
      energy: 100,
    },
    {
      id: 2,
      title: "AI-Powered Intelligence",
      date: "Advanced",
      content: "Advanced AI algorithms understand context, punctuation, and speaker intent for more natural text output.",
      category: "Intelligence",
      icon: Brain,
      relatedIds: [1, 3],
      status: "completed" as const,
      energy: 95,
    },
    {
      id: 3,
      title: "Smart Organization",
      date: "Automated",
      content: "Automatically structure your transcriptions with intelligent formatting, timestamps, and speaker identification.",
      category: "Organization",
      icon: FileText,
      relatedIds: [2, 6],
      status: "completed" as const,
      energy: 90,
    },
    {
      id: 4,
      title: "Lightning Fast",
      date: "Milliseconds",
      content: "Process audio files or live speech in milliseconds. No waiting, no delays - just instant results.",
      category: "Performance",
      icon: Zap,
      relatedIds: [1, 5],
      status: "in-progress" as const,
      energy: 85,
    },
    {
      id: 5,
      title: "Secure & Private",
      date: "Enterprise",
      content: "End-to-end encryption ensures your conversations remain confidential. GDPR compliant and SOC 2 certified.",
      category: "Security",
      icon: Shield,
      relatedIds: [4, 6],
      status: "completed" as const,
      energy: 80,
    },
    {
      id: 6,
      title: "Multi-language Support",
      date: "Global",
      content: "Supports 50+ languages with regional accents and dialects. Break down language barriers effortlessly.",
      category: "Languages",
      icon: Globe,
      relatedIds: [3, 5],
      status: "in-progress" as const,
      energy: 75,
    }
  ];

  return (
    <section className="relative bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 pt-20 pb-10 text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Experience the future of voice transcription with cutting-edge AI technology
          </p>
        </motion.div>
      </div>
      
      <div className="relative">
        <RadialOrbitalTimeline timelineData={timelineData} />
      </div>
    </section>
  );
};