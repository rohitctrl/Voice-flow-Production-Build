"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, GraduationCap, Lightbulb, Phone, Headphones, CheckSquare, Building2, Users } from 'lucide-react';

export const UseCasesSection = () => {
  const useCases = [
    {
      icon: FileText,
      title: "Meeting Notes",
      description: "Record and transcribe meetings instantly",
      details: ["Capture every detail", "Share with team", "Action items highlighted"],
      color: "bg-gray-600",
      iconColor: "text-white"
    },
    {
      icon: GraduationCap,
      title: "Student Notes",
      description: "Capture lectures and study sessions",
      details: ["Never miss important points", "Review anytime", "Perfect for exams"],
      color: "bg-purple-500",
      iconColor: "text-white"
    },
    {
      icon: Lightbulb,
      title: "Voice Journaling",
      description: "Quick voice memos and idea capture",
      details: ["Instant thoughts", "Daily reflections", "Creative ideas"],
      color: "bg-orange-500",
      iconColor: "text-white"
    },
    {
      icon: Phone,
      title: "Interview Transcripts",
      description: "Perfect for journalists and researchers",
      details: ["High accuracy", "Speaker identification", "Time-stamped"],
      color: "bg-gray-600",
      iconColor: "text-white"
    },
    {
      icon: Headphones,
      title: "Podcast Notes",
      description: "Content creators and podcasters",
      details: ["Episode summaries", "Key quotes", "Show notes"],
      color: "bg-pink-500",
      iconColor: "text-white"
    },
    {
      icon: CheckSquare,
      title: "Voice To-Do Lists",
      description: "Speak your tasks and reminders",
      details: ["Quick task entry", "Priority setting", "Never forget"],
      color: "bg-gray-600",
      iconColor: "text-white"
    }
  ];

  const industries = [
    { icon: Building2, name: "Business", users: "5k+" },
    { icon: GraduationCap, name: "Education", users: "3k+" },
    { icon: Users, name: "Healthcare", users: "1k+" },
    { icon: FileText, name: "Legal", users: "800+" }
  ];

  return (
    <section className="py-20 px-6 bg-black relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-6">
            Perfect For Every Use Case
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Whether you're a student, professional, or creative, Voiceflow adapts 
            to your unique voice transcription needs.
          </p>
        </motion.div>

        {/* Use Cases Grid - Redesigned to match screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden"
            >
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 h-full">
                {/* Icon with solid background matching screenshot */}
                <div className={`w-16 h-16 ${useCase.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <useCase.icon className={`h-8 w-8 ${useCase.iconColor}`} />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  {useCase.title}
                </h3>
                
                <p className="text-gray-400 text-base mb-6 leading-relaxed">
                  {useCase.description}
                </p>
                
                <ul className="space-y-3">
                  {useCase.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Industries Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl p-8 border border-gray-700/50"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Trusted by Professionals Across Industries
            </h3>
            <p className="text-gray-300">
              Join thousands of professionals who rely on Voiceflow daily
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {industries.map((industry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-4 rounded-xl bg-black/20 border border-gray-700/30"
              >
                <div className="w-12 h-12 bg-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <industry.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-1">
                  {industry.name}
                </h4>
                <p className="text-white text-sm font-medium">
                  {industry.users} users
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Transform Your Workflow?
          </h3>
          <p className="text-gray-400 mb-6">
            Start with our free tier - no credit card required
          </p>
          <button className="px-8 py-4 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
            Get Started Free
          </button>
        </motion.div>
      </div>
    </section>
  );
};