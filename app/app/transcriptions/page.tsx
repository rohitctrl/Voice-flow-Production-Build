"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  FileText, 
  Search, 
  Filter, 
  Play, 
  Pause,
  Download, 
  Edit3, 
  Trash2,
  Clock, 
  Calendar, 
  Zap, 
  Share2,
  Star,
  MoreVertical,
  ChevronDown,
  Eye,
  Archive,
  Tags,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserTranscriptions, getUserStats } from '@/lib/database';

const TranscriptionsPage = () => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('list'); // list or grid
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [transcriptions, setTranscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalTranscriptions: 0,
    totalDuration: 0,
    averageAccuracy: 0,
    monthlyCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTranscriptions() {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const [transcriptionsData, userStats] = await Promise.all([
          getUserTranscriptions(session.user.id),
          getUserStats(session.user.id)
        ]);

        setTranscriptions(transcriptionsData);
        setStats(userStats);
      } catch (error) {
        console.error('Failed to load transcriptions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTranscriptions();
  }, [session]);

  // Keep this mock data as fallback for demo (remove in production)
  const mockTranscriptions = [
    {
      id: 1,
      title: 'Team Meeting - Q4 Planning Session',
      duration: '45:23',
      date: '2 hours ago',
      createdAt: '2024-01-15',
      accuracy: 99.1,
      status: 'completed',
      wordCount: 4521,
      speakers: 4,
      tags: ['meeting', 'planning', 'Q4'],
      starred: true,
      preview: 'Today we discussed the quarterly planning for Q4. The main objectives include expanding our product line, improving customer satisfaction scores, and increasing market share by 15%...',
      audioUrl: '/audio/meeting-1.wav',
      project: 'Product Team'
    },
    {
      id: 2,
      title: 'Customer Interview #3 - Sarah Johnson',
      duration: '28:47',
      date: '5 hours ago', 
      createdAt: '2024-01-15',
      accuracy: 98.8,
      status: 'completed',
      wordCount: 2847,
      speakers: 2,
      tags: ['interview', 'customer', 'feedback'],
      starred: false,
      preview: 'Thank you for joining us today Sarah. Could you tell us about your experience with our product over the past few months? What specific features do you find most valuable?...',
      audioUrl: '/audio/interview-3.wav',
      project: 'User Research'
    },
    {
      id: 3,
      title: 'Voice Notes - Product Feature Ideas',
      duration: '12:15',
      date: 'Yesterday',
      createdAt: '2024-01-14',
      accuracy: 99.5,
      status: 'completed',
      wordCount: 1234,
      speakers: 1,
      tags: ['brainstorm', 'features', 'product'],
      starred: true,
      preview: 'I had some interesting ideas about the new feature set while reviewing user feedback. First, we could implement a smart categorization system that automatically tags transcriptions based on content...',
      audioUrl: '/audio/voice-notes-1.wav',
      project: 'Personal'
    },
    {
      id: 4,
      title: 'Conference Call - Quarterly Stakeholder Meeting',
      duration: '1:05:12',
      date: '2 days ago',
      createdAt: '2024-01-13',
      accuracy: 97.9,
      status: 'completed',
      wordCount: 8123,
      speakers: 8,
      tags: ['stakeholders', 'quarterly', 'review'],
      starred: false,
      preview: 'Welcome everyone to our quarterly stakeholder meeting. I\'d like to start with a review of our performance metrics. Revenue is up 23% compared to last quarter, and customer satisfaction has improved significantly...',
      audioUrl: '/audio/stakeholder-meeting.wav',
      project: 'Executive'
    },
    {
      id: 5,
      title: 'Podcast Recording - Episode 12',
      duration: '52:33',
      date: '3 days ago',
      createdAt: '2024-01-12',
      accuracy: 98.4,
      status: 'processing',
      wordCount: 6834,
      speakers: 3,
      tags: ['podcast', 'content', 'episode'],
      starred: false,
      preview: 'Processing...',
      audioUrl: '/audio/podcast-12.wav',
      project: 'Content'
    },
    {
      id: 6,
      title: 'Legal Deposition - Case #2024-105',
      duration: '2:15:45',
      date: '1 week ago',
      createdAt: '2024-01-08',
      accuracy: 99.8,
      status: 'completed',
      wordCount: 12847,
      speakers: 6,
      tags: ['legal', 'deposition', 'confidential'],
      starred: true,
      preview: 'This deposition is being recorded for Case #2024-105. Present are the plaintiff, defendant, legal counsel, and court reporter. We will proceed with questioning regarding the events of...',
      audioUrl: '/audio/deposition-105.wav',
      project: 'Legal'
    }
  ];

  // Use real data if available, fallback to mock for demo
  const displayTranscriptions = transcriptions.length > 0 ? transcriptions : mockTranscriptions;

  // Add utility functions
  const formatDurationFromSeconds = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRelativeTime = (date) => {
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
  };

  const filteredTranscriptions = displayTranscriptions.filter(item => {
    // Handle both real data and mock data structures
    const title = item.title || '';
    const content = item.content || item.preview || '';
    const tags = item.tags || [];
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(tags) && tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'starred' && item.starred) ||
                         (filterBy === 'recent' && (item.date?.includes('hour') || isRecent(item.created_at))) ||
                         (filterBy === 'completed' && item.status === 'completed') ||
                         (filterBy === 'processing' && item.status === 'processing');
    
    return matchesSearch && matchesFilter;
  });

  const isRecent = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 3600);
    return hoursDiff < 24;
  };

  const toggleSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'processing': return 'text-yellow-400 bg-yellow-400/10';
      case 'error': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your transcriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
              Transcriptions 📝
            </h1>
            <p className="text-gray-400 text-lg">
              Manage and organize all your voice transcriptions
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedItems.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-2"
              >
                <span className="text-white text-sm">{selectedItems.length} selected</span>
                <button className="p-1 hover:bg-gray-700/50 rounded">
                  <Download className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-700/50 rounded">
                  <Archive className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-700/50 rounded">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transcriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-gray-600/50 focus:outline-none"
            />
          </div>
          
          <select 
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
          >
            <option value="all">All Transcriptions</option>
            <option value="starred">Starred</option>
            <option value="recent">Recent</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="duration">By Duration</option>
            <option value="accuracy">By Accuracy</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        {[
          { 
            label: 'Total Transcriptions', 
            value: displayTranscriptions.length, 
            icon: FileText, 
            color: 'from-gray-700 to-gray-800' 
          },
          { 
            label: 'Total Duration', 
            value: formatDurationFromSeconds(stats.totalDuration), 
            icon: Clock, 
            color: 'from-purple-500 to-gray-800' 
          },
          { 
            label: 'Avg. Accuracy', 
            value: `${stats.averageAccuracy.toFixed(1)}%`, 
            icon: Zap, 
            color: 'from-green-500 to-gray-800' 
          },
          { 
            label: 'This Month', 
            value: stats.monthlyCount.toString(), 
            icon: Calendar, 
            color: 'from-gray-600 to-gray-700' 
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Transcriptions List */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {filteredTranscriptions.length} Transcription{filteredTranscriptions.length !== 1 ? 's' : ''}
            </h2>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {filteredTranscriptions.map((transcription, index) => (
                <motion.div
                  key={transcription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "group p-6 bg-black/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 cursor-pointer",
                    selectedItems.includes(transcription.id) && "border-white/30 bg-white/5"
                  )}
                  onClick={() => toggleSelection(transcription.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox"
                          checked={selectedItems.includes(transcription.id)}
                          onChange={() => toggleSelection(transcription.id)}
                          className="rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {transcription.starred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg group-hover:text-white transition-colors duration-200">
                            {transcription.title}
                          </h3>
                          <div className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
                            getStatusColor(transcription.status)
                          )}>
                            {transcription.status}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-gray-400 text-sm mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {transcription.duration || formatDurationFromSeconds(transcription.duration_seconds)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {transcription.date || formatRelativeTime(transcription.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            {transcription.accuracy || 0}%
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {(transcription.wordCount || transcription.word_count || 0).toLocaleString()} words
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {transcription.speakers || transcription.speaker_count || 0} speaker{(transcription.speakers || transcription.speaker_count || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">
                          {transcription.preview || transcription.content?.substring(0, 150) + '...' || 'No preview available'}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          {(transcription.tags || []).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-md"
                            >
                              #{typeof tag === 'string' ? tag : tag.name}
                            </span>
                          ))}
                          {(transcription.project || transcription.project_name) && (
                            <span className="text-gray-500 text-xs ml-2">
                              Project: {transcription.project || transcription.project_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
                        <Play className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
                        <Eye className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
                        <Edit3 className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
                        <Share2 className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
                        <Download className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TranscriptionsPage;