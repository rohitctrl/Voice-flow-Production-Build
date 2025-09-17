"use client";
import React from 'react';
import { motion } from 'framer-motion';
import TextMarquee from './text-marquee';

export const UserTestimonialsFlow = () => {
  return (
    <section className="py-20 px-6 bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-8">
            What our users are saying
          </h2>
        </motion.div>

        {/* Flowing Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <TextMarquee
              delay={0}
              baseVelocity={-1}
              clasname="font-bold tracking-[-0.02em] leading-[90%] text-gray-600/60 text-[5vw] md:text-[4vw]"
            >
              "Game-changer for meetings!" • "Incredible transcription quality" • "Perfect for workflow!" • 
            </TextMarquee>
            
            <TextMarquee
              delay={500}
              baseVelocity={1.2}
              clasname="font-bold tracking-[-0.02em] leading-[90%] text-gray-600/60 text-[5vw] md:text-[4vw]"
            >
              "Revolutionized my workflow" • "Speaker identification is amazing" • "Better than any other service" •
            </TextMarquee>
            
            <TextMarquee
              delay={1000}
              baseVelocity={-0.8}
              clasname="font-bold tracking-[-0.02em] leading-[90%] text-gray-600/60 text-[5vw] md:text-[4vw]"
            >
              "Never miss important points" • "Lifesaver for interviews" • "I love the accuracy!" •
            </TextMarquee>
          </div>
        </motion.div>
      </div>
    </section>
  );
};