"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { 
  Chrome, 
  Github, 
  Mic,
  ArrowRight,
  Shield,
  Zap,
  Users
} from 'lucide-react';

const SignInPage = () => {
  const providers = [
    {
      id: 'google',
      name: 'Google',
      icon: Chrome,
      color: 'from-red-500 to-orange-500',
      description: 'Continue with your Google account'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      color: 'from-gray-700 to-gray-900',
      description: 'Continue with your GitHub account'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your transcriptions are encrypted and secure'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get transcriptions in seconds with AI'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share and collaborate with your team'
    }
  ];

  const handleSignIn = async (providerId: string) => {
    await signIn(providerId, { callbackUrl: '/app' });
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Voiceflow</h1>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Transform Your Voice Into
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Perfect Text</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of professionals using AI-powered transcription to boost productivity and never miss important details.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-4 text-left"
                >
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{feature.title}</h4>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Sign In Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
                <p className="text-gray-400">Sign in to continue to your dashboard</p>
              </div>

              <div className="space-y-4">
                {providers.map((provider, index) => (
                  <motion.button
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    onClick={() => handleSignIn(provider.id)}
                    className="w-full group relative overflow-hidden"
                  >
                    <div className={`w-full flex items-center gap-4 p-4 bg-gradient-to-r ${provider.color} hover:opacity-90 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform group-hover:scale-[1.02]`}>
                      <provider.icon className="h-5 w-5" />
                      <div className="flex-1 text-left">
                        <div className="font-semibold">Continue with {provider.name}</div>
                        <div className="text-xs opacity-90">{provider.description}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                    Privacy Policy
                  </a>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Shield className="h-4 w-4" />
                  <span>Secure authentication powered by NextAuth</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 grid grid-cols-3 gap-4 text-center"
            >
              <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/30">
                <div className="text-white font-bold text-lg">10k+</div>
                <div className="text-gray-400 text-xs">Active Users</div>
              </div>
              <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/30">
                <div className="text-white font-bold text-lg">99.2%</div>
                <div className="text-gray-400 text-xs">Accuracy</div>
              </div>
              <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/30">
                <div className="text-white font-bold text-lg">1M+</div>
                <div className="text-gray-400 text-xs">Transcriptions</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;