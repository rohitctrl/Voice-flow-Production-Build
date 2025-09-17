"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

const SonicWaveformCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        let time = 0;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const lineCount = 60;
            const segmentCount = 80;
            const height = canvas.height / 2;
            
            for (let i = 0; i < lineCount; i++) {
                ctx.beginPath();
                const progress = i / lineCount;
                const colorIntensity = Math.sin(progress * Math.PI);
                
                // Create multi-color gradient effect
                const hue = (progress * 360 + time * 50) % 360; // Cycling through hue spectrum
                const saturation = 70 + Math.sin(time + i * 0.1) * 20; // Dynamic saturation
                const lightness = 50 + Math.sin(time * 0.5 + i * 0.3) * 30; // Dynamic lightness
                
                ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${colorIntensity * 0.7})`;
                ctx.lineWidth = 1.5 + Math.sin(time + i * 0.2) * 0.5; // Dynamic line width

                for (let j = 0; j < segmentCount + 1; j++) {
                    const x = (j / segmentCount) * canvas.width;
                    
                    const distToMouse = Math.hypot(x - mouse.x, (height) - mouse.y);
                    const mouseEffect = Math.max(0, 1 - distToMouse / 400);

                    const noise = Math.sin(j * 0.1 + time + i * 0.2) * 20;
                    const spike = Math.cos(j * 0.2 + time + i * 0.1) * Math.sin(j * 0.05 + time) * 50;
                    const y = height + noise + spike * (1 + mouseEffect * 2);
                    
                    if (j === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            time += 0.02;
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        
        resizeCanvas();
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full bg-black" />;
};

const VoiceflowHero = () => {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.2 + 0.5,
                duration: 0.8,
                ease: "easeInOut",
            },
        }),
    };

    return (
        <div id="hero-section" className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
            <SonicWaveformCanvas />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none"></div>

            <div className="relative z-20 text-center p-6 pointer-events-none">

                <motion.h1
                    custom={1} 
                    variants={fadeUpVariants} 
                    initial="hidden" 
                    animate="visible"
                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 leading-tight"
                >
                    Voiceflow
                    <br />
                    <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">Transform Voice Into Text</span>
                </motion.h1>

                

                <motion.div
                    custom={3} 
                    variants={fadeUpVariants} 
                    initial="hidden" 
                    animate="visible"
                    className="mb-8"
                >
                    <button 
                        onClick={() => window.location.href = '/auth/signin'}
                        className="px-10 py-5 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-lg rounded-xl shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto pointer-events-auto transform hover:scale-105"
                    >
                        <Mic className="h-6 w-6" />
                        Start Transcribing
                        <ArrowRight className="h-5 w-5" />
                    </button>
                    <p className="text-sm text-gray-400 mt-3">
                        No sign-up required • Works in your browser
                    </p>
                </motion.div>

                <motion.div
                    custom={4} 
                    variants={fadeUpVariants} 
                    initial="hidden" 
                    animate="visible"
                    className="flex items-center justify-center gap-2 text-amber-400"
                >
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-xl">⭐</span>
                        ))}
                    </div>
                    <span className="text-white ml-2">Loved by 10,000+ users</span>
                </motion.div>
            </div>
        </div>
    );
};

export default VoiceflowHero;