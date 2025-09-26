"use client";
import React from "react";
import { motion } from "framer-motion";
import { Mic, FileText, Zap, Brain, Shield, Globe } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      title: "Real-time Transcription",
      content: "Convert speech to text instantly with industry-leading accuracy. Perfect for meetings, interviews, and content creation.",
      icon: Mic,
    },
    {
      title: "AI-Powered Intelligence",
      content: "Advanced AI algorithms understand context, punctuation, and speaker intent for more natural text output.",
      icon: Brain,
    },
    {
      title: "Smart Organization",
      content: "Automatically structure your transcriptions with intelligent formatting, timestamps, and speaker identification.",
      icon: FileText,
    },
    {
      title: "Lightning Fast",
      content: "Process audio files or live speech in milliseconds. No waiting, no delays - just instant results.",
      icon: Zap,
    },
    {
      title: "Secure & Private",
      content: "End-to-end encryption ensures your conversations remain confidential. GDPR compliant and SOC 2 certified.",
      icon: Shield,
    },
    {
      title: "Multi-language Support",
      content: "Supports 50+ languages with regional accents and dialects. Break down language barriers effortlessly.",
      icon: Globe,
    }
  ];

  return (
    <section className="relative py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Experience the future of voice transcription with cutting-edge AI technology
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};