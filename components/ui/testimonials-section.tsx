"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Users, TrendingUp, Award, MapPin } from 'lucide-react';
import TextMarquee from './text-marquee';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechFlow Inc.",
      avatar: "SC",
      location: "San Francisco, CA",
      content: "Game-changer for my meetings! I can finally focus on conversations instead of furiously taking notes. The accuracy is incredible - it even catches technical terms perfectly.",
      rating: 5,
      color: "from-pink-500 to-rose-500"
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Research Scientist",
      company: "Stanford University",
      avatar: "MR", 
      location: "Palo Alto, CA",
      content: "Better than any other transcription service I've tried. The AI understands context remarkably well, and it's been invaluable for transcribing patient interviews.",
      rating: 5,
      color: "from-gray-700 to-gray-800"
    },
    {
      name: "Prof. Emily Johnson",
      role: "Professor",
      company: "University of Chicago",
      avatar: "EJ",
      location: "Chicago, IL", 
      content: "So simple and fast! My students love using this for lecture notes. The real-time processing means they never miss important points during discussions.",
      rating: 5,
      color: "from-gray-700 to-purple-500"
    },
    {
      name: "James Kumar",
      role: "Content Creator",
      company: "YouTube Channel",
      avatar: "JK",
      location: "Austin, TX",
      content: "Voiceflow has revolutionized my content workflow. I can quickly transcribe video ideas, podcast episodes, and meeting notes without breaking my creative flow.",
      rating: 5,
      color: "from-purple-500 to-violet-500"
    },
    {
      name: "Maria Gonzalez",
      role: "Journalist",
      company: "The Digital Herald",
      avatar: "MG",
      location: "New York, NY",
      content: "The speaker identification feature is a lifesaver for interviews. Accuracy is outstanding even with multiple voices and background noise.",
      rating: 5,
      color: "from-amber-500 to-orange-500"
    },
    {
      name: "Alex Thompson",
      role: "Startup Founder",
      company: "InnovateLab",
      avatar: "AT",
      location: "Seattle, WA",
      content: "We use Voiceflow for all our team meetings and brainstorming sessions. The collaborative features and export options make it perfect for our workflow.",
      rating: 5,
      color: "from-gray-700 to-gray-800"
    }
  ];

  const stats = [
    { icon: Users, value: "10,000+", label: "Active Users", description: "Professionals trust Voiceflow daily" },
    { icon: TrendingUp, value: "1M+", label: "Voice Notes", description: "Transcribed with 99%+ accuracy" },
    { icon: Award, value: "500+", label: "Companies", description: "Using Voiceflow for business" },
    { icon: Star, value: "4.9/5", label: "User Rating", description: "Based on 2,000+ reviews" }
  ];

  const companies = [
    "TechFlow", "Stanford", "Chicago Uni", "InnovateLab", "Digital Herald", "YouTube"
  ];

  return (
    <section className="py-20 px-6 relative overflow-hidden">

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Loved by Professionals Worldwide
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join thousands of professionals who have transformed their workflow with Voiceflow's 
            AI-powered transcription technology.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-gray-700/30"
            >
              <div className="w-12 h-12 bg-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white font-semibold text-sm mb-1">{stat.label}</div>
              <div className="text-gray-400 text-xs">{stat.description}</div>
            </motion.div>
          ))}
        </motion.div>


        {/* Scrolling Testimonials Marquee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <p className="text-center text-gray-400 text-sm mb-8">What our users are saying</p>
          
          <div className="space-y-6">
            <TextMarquee
              delay={500}
              baseVelocity={-2}
              clasname="font-bold tracking-[-0.02em] leading-[90%] text-white/10 text-[4vw] md:text-[3vw]"
            >
              "Game-changer for meetings!" • "Incredible transcription quality" • "Perfect for lectures" • 
            </TextMarquee>
            
            <TextMarquee
              delay={1000}
              baseVelocity={2}
              clasname="font-bold tracking-[-0.02em] leading-[90%] text-white/10 text-[4vw] md:text-[3vw]"
            >
              "Revolutionized my workflow" • "Speaker identification is amazing" • "So simple and fast!" •
            </TextMarquee>
            
            <TextMarquee
              delay={1500}
              baseVelocity={-1.5}
              clasname="font-bold tracking-[-0.02em] leading-[90%] text-white/10 text-[4vw] md:text-[3vw]"
            >
              "Better than any other service" • "Never miss important points" • "Lifesaver for interviews" •
            </TextMarquee>
          </div>
        </motion.div>

      </div>
    </section>
  );
};