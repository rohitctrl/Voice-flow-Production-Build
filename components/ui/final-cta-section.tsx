"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Target, Shield, DollarSign, Clock, Users, Star } from 'lucide-react';

export const FinalCTASection = () => {
  const benefits = [
    { icon: Clock, text: "Set up in 30 seconds" },
    { icon: Target, text: "99%+ transcription accuracy" },
    { icon: Shield, text: "Your data stays private" },
    { icon: DollarSign, text: "Free tier includes 30 minutes/month" }
  ];

  const trustSignals = [
    { icon: Users, value: "10,000+", label: "Happy Users" },
    { icon: Star, value: "4.9/5", label: "User Rating" },
    { icon: Shield, value: "SOC 2", label: "Certified" },
    { icon: Zap, value: "99%+", label: "Accuracy" }
  ];

  return (
    <section className="py-20 px-6 relative overflow-hidden">

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-6 leading-tight">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              How You Capture Ideas?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
            Join thousands of professionals who've already made the switch to faster, smarter note-taking with intelligent voice-to-text technology.
          </p>

          {/* Primary CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <button className="group px-12 py-6 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-xl rounded-2xl shadow-2xl shadow-white/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-4 mx-auto">
              Start Your Free Trial
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowRight className="h-6 w-6" />
              </motion.div>
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-gray-400 text-lg mb-12"
          >
            No credit card required • Cancel anytime • 30-day money-back guarantee
          </motion.p>

          {/* Benefits List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-4"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <benefit.icon className="h-6 w-6 text-white/80" />
                </div>
                <span className="text-gray-300 text-sm font-medium leading-tight">
                  {benefit.text}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-3">
              Trusted by Professionals Worldwide
            </h3>
            <p className="text-gray-400">
              Join the thousands who've already transformed their workflow
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustSignals.map((signal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <signal.icon className="h-8 w-8 text-white/80" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{signal.value}</div>
                <div className="text-gray-400 text-sm">{signal.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Alternative CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-400 mb-8">
            Want to see it in action first? Try our demo above or explore our features.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-300">
              Try Demo Above
            </button>
            <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-300">
              View Pricing
            </button>
            <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-300">
              Contact Sales
            </button>
          </div>
        </motion.div>

        {/* Final Urgency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16 p-6 bg-gradient-to-r from-white/5 to-gray-800/20 rounded-xl border border-white/20"
        >
          <p className="text-gray-300 mb-4">
            <strong className="text-white/80">Limited Time:</strong> Get 50% more free minutes when you sign up today
          </p>
          <p className="text-gray-400 text-sm">
            Don't wait – start transforming your productivity with AI-powered transcription now
          </p>
        </motion.div>
      </div>
    </section>
  );
};