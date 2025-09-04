"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { getUserStats, getUserTranscriptions, getUserProjects } from '@/lib/database';
import { 
  Mic, 
  FileText, 
  Clock, 
  TrendingUp, 
  Star,
  Play,
  Download,
  Edit3,
  Calendar,
  Zap,
  Users,
  ArrowRight,
  Plus,
  Upload,
  FolderOpen
} from 'lucide-react';

const Dashboard = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState([
    {
      icon: FileText,
      label: 'Total Transcriptions',
      value: '0',
      change: '',
      changeType: 'neutral',
      color: 'from-gray-700 to-gray-800'
    },
    {
      icon: Clock,
      label: 'Hours Transcribed',
      value: '0',
      change: '',
      changeType: 'neutral',
      color: 'from-gray-700 to-gray-800'
    },
    {
      icon: TrendingUp,
      label: 'Accuracy Rate',
      value: '0%',
      change: '',
      changeType: 'neutral',
      color: 'from-gray-700 to-purple-500'
    },
    {
      icon: Star,
      label: 'Minutes Remaining',
      value: '∞',
      change: 'Pro Plan',
      changeType: 'neutral',
      color: 'from-purple-500 to-gray-800'
    }
  ]);
  const [recentTranscriptions, setRecentTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        
        // Get user stats
        const userStats = await getUserStats(session.user.id);
        
        // Get recent transcriptions (limit to 4 for dashboard)
        const transcriptions = await getUserTranscriptions(session.user.id, 4);

        // Update stats with real data
        setStats([
          {
            icon: FileText,
            label: 'Total Transcriptions',
            value: userStats.totalTranscriptions.toString(),
            change: userStats.transcriptionGrowth ? `+${userStats.transcriptionGrowth}%` : '',
            changeType: userStats.transcriptionGrowth > 0 ? 'positive' : 'neutral',
            color: 'from-gray-700 to-gray-800'
          },
          {
            icon: Clock,
            label: 'Hours Transcribed',
            value: (userStats.totalDuration / 3600).toFixed(1),
            change: userStats.durationGrowth ? `+${userStats.durationGrowth}%` : '',
            changeType: userStats.durationGrowth > 0 ? 'positive' : 'neutral',
            color: 'from-gray-700 to-gray-800'
          },
          {
            icon: TrendingUp,
            label: 'Accuracy Rate',
            value: `${userStats.averageAccuracy.toFixed(1)}%`,
            change: userStats.accuracyChange ? `+${userStats.accuracyChange.toFixed(1)}%` : '',
            changeType: userStats.accuracyChange > 0 ? 'positive' : 'neutral',
            color: 'from-gray-700 to-purple-500'
          },
          {
            icon: Star,
            label: 'Minutes Remaining',
            value: '∞',
            change: 'Pro Plan',
            changeType: 'neutral',
            color: 'from-purple-500 to-gray-800'
          }
        ]);

        // Format transcriptions for display
        const formattedTranscriptions = transcriptions.map(t => ({
          id: t.id,
          title: t.title,
          duration: formatDuration(t.duration * 1000),
          date: formatRelativeTime(t.created_at),
          accuracy: t.accuracy,
          status: t.status,
          preview: t.content ? t.content.substring(0, 100) + '...' : 'Processing...'
        }));

        setRecentTranscriptions(formattedTranscriptions);
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [session]);

  function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  function formatRelativeTime(date) {
    const now = new Date();
    const time = new Date(date);
    const diff = now.getTime() - time.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }

  const quickActions = [
    {
      icon: Mic,
      title: 'Quick Record',
      description: 'Start recording immediately',
      color: 'from-blue-500 to-cyan-500',
      href: '/app/upload'
    },
    {
      icon: Upload,
      title: 'Upload File',
      description: 'Transcribe an audio file',
      color: 'from-green-500 to-emerald-500',
      href: '/app/upload'
    },
    {
      icon: FolderOpen,
      title: 'New Project',
      description: 'Organize your transcriptions',
      color: 'from-purple-500 to-pink-500',
      href: '/app/projects'
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div 
        {...fadeInUp}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}! 👋
        </h1>
        <p className="text-gray-400 text-lg">
          Here's what's happening with your transcriptions today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
                stat.changeType === 'positive' 
                  ? 'text-white bg-white/10' 
                  : stat.changeType === 'negative'
                  ? 'text-red-400 bg-red-400/10'
                  : 'text-gray-400 bg-gray-400/10'
              }`}>
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Transcriptions */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="xl:col-span-2"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Transcriptions</h2>
              <button className="text-white hover:text-gray-200 transition-colors duration-200 flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {recentTranscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No transcriptions yet</p>
                  <p className="text-gray-500 text-sm">Upload your first audio file to get started!</p>
                </div>
              ) : (
                recentTranscriptions.map((transcription, index) => (
                  <motion.div
                    key={transcription.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="p-4 bg-black/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 group cursor-pointer"
                  >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold group-hover:text-white transition-colors duration-200">
                        {transcription.title}
                      </h3>
                      <div className="flex items-center gap-4 text-gray-400 text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {transcription.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {transcription.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {transcription.accuracy}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                        <Play className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                        <Edit3 className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                        <Download className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                    {transcription.preview}
                  </p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-4 p-4 bg-gradient-to-r ${action.color} hover:opacity-90 text-white font-semibold rounded-xl shadow-lg transition-all duration-300`}
                >
                  <action.icon className="h-5 w-5" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Usage This Month */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Usage This Month</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Minutes Used</span>
                  <span className="text-white font-semibold">∞ / ∞</span>
                </div>
                <div className="w-full bg-gray-700/30 rounded-full h-2">
                  <div className="bg-gradient-to-r from-gray-700 to-gray-800 h-2 rounded-full w-full" />
                </div>
                <p className="text-xs text-gray-400 mt-2">Pro Plan - Unlimited usage</p>
              </div>
              
              <div className="pt-4 border-t border-gray-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-5 w-5 text-white" />
                  <span className="text-white font-semibold">Team Activity</span>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>• 5 new transcriptions this week</div>
                  <div>• 2.5 hours of audio processed</div>
                  <div>• 99.1% average accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;