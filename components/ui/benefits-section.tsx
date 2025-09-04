"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Smartphone, Target, Shield, Globe, Clock } from 'lucide-react';

export const BenefitsSection = () => {
  const benefits = [
    {
      icon: Zap,
      title: "Instant Transcription",
      description: "Start talking, see text appear in real-time with 99%+ accuracy",
      highlight: "3x faster than typing"
    },
    {
      icon: Smartphone,
      title: "Works Everywhere",
      description: "Browser, mobile, offline capable. No downloads needed",
      highlight: "Any device, anywhere"
    },
    {
      icon: Target,
      title: "Accurate & Smart",
      description: "Industry-leading AI that understands context and meaning",
      highlight: "99%+ accuracy rate"
    }
  ];

  const additionalBenefits = [
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your voice stays secure and private with enterprise-grade encryption"
    },
    {
      icon: Globe,
      title: "Multi-language",
      description: "Supports 30+ languages with regional accents and dialects"
    },
    {
      icon: Clock,
      title: "Time Saver",
      description: "Save hours every week with lightning-fast voice capture"
    }
  ];

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the perfect combination of speed, accuracy, and convenience 
            in voice transcription technology.
          </p>
        </motion.div>

        {/* Main Benefits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-white/50 transition-all duration-300 h-full group-hover:transform group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-gray-700/20 rounded-full flex items-center justify-center mb-6 group-hover:from-pink-500/30 group-hover:via-purple-500/30 group-hover:to-gray-700/30 transition-colors duration-300">
                  <benefit.icon className="h-8 w-8 text-white/80" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  {benefit.title}
                </h3>
                
                <div className="bg-gradient-to-r from-gray-600/10 via-gray-700/10 to-purple-500/10 px-4 py-2 rounded-full inline-block mb-4 border border-white/20">
                  <span className="text-white/80 font-semibold text-sm">
                    {benefit.highlight}
                  </span>
                </div>
                
                <p className="text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {additionalBenefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-white/80" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">
                    {benefit.title}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-white/5 to-gray-800/20 rounded-2xl p-8 border border-white/20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white/80 mb-2">99%+</div>
              <div className="text-gray-300 text-sm">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white/80 mb-2">3x</div>
              <div className="text-gray-300 text-sm">Faster than Typing</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white/80 mb-2">30+</div>
              <div className="text-gray-300 text-sm">Languages</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white/80 mb-2">10k+</div>
              <div className="text-gray-300 text-sm">Happy Users</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};