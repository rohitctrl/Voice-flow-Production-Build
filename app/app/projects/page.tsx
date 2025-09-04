"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  FolderPlus, 
  Search, 
  Filter, 
  Users, 
  Calendar,
  FileText,
  Clock,
  Settings,
  ChevronRight,
  Star,
  MoreVertical,
  Edit3,
  Trash2,
  Share2,
  Archive,
  TrendingUp,
  Target,
  Folder,
  UserPlus,
  Download,
  Eye,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserProjects, getProjectStats } from '@/lib/database';

interface Project {
  id: number;
  name: string;
  description: string;
  color: string;
  transcriptionCount: number;
  totalDuration: string;
  lastUpdated: string;
  createdAt: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  members: {
    id: number;
    name: string;
    avatar: string;
    role: string;
  }[];
  recentTranscriptions: {
    id: number;
    title: string;
    date: string;
    duration: string;
  }[];
  tags: string[];
  starred: boolean;
}

const ProjectsPage = () => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTranscriptions: 0,
    totalDuration: 0,
    activeProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const [projectsData, projectStats] = await Promise.all([
          getUserProjects(session.user.id),
          getProjectStats(session.user.id)
        ]);

        setProjects(projectsData);
        setStats(projectStats);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [session]);

  // Keep mock data for demo (remove in production)
  const mockProjects: Project[] = [
    {
      id: 1,
      name: "Product Team Meetings",
      description: "Weekly team meetings, sprint planning sessions, and product strategy discussions",
      color: "from-purple-500 to-pink-500",
      transcriptionCount: 24,
      totalDuration: "18h 45m",
      lastUpdated: "2 hours ago",
      createdAt: "2024-01-01",
      progress: 85,
      status: "active",
      members: [
        { id: 1, name: "Sarah Chen", avatar: "SC", role: "Product Manager" },
        { id: 2, name: "Mike Johnson", avatar: "MJ", role: "Developer" },
        { id: 3, name: "Lisa Wong", avatar: "LW", role: "Designer" }
      ],
      recentTranscriptions: [
        { id: 1, title: "Q4 Planning Session", date: "2 hours ago", duration: "45:23" },
        { id: 2, title: "Sprint Retrospective", date: "1 day ago", duration: "32:15" },
        { id: 3, title: "User Feedback Review", date: "2 days ago", duration: "28:47" }
      ],
      tags: ["meetings", "planning", "product"],
      starred: true
    },
    {
      id: 2,
      name: "Customer Interviews",
      description: "User research interviews, customer feedback sessions, and usability tests",
      color: "from-blue-500 to-cyan-500",
      transcriptionCount: 18,
      totalDuration: "12h 30m",
      lastUpdated: "5 hours ago",
      createdAt: "2024-01-05",
      progress: 60,
      status: "active",
      members: [
        { id: 4, name: "Dr. Rodriguez", avatar: "DR", role: "Researcher" },
        { id: 5, name: "Emily Johnson", avatar: "EJ", role: "UX Designer" }
      ],
      recentTranscriptions: [
        { id: 4, title: "Customer Interview #15", date: "5 hours ago", duration: "28:30" },
        { id: 5, title: "Usability Test Session", date: "1 day ago", duration: "45:12" },
        { id: 6, title: "Beta User Feedback", date: "3 days ago", duration: "35:08" }
      ],
      tags: ["research", "interviews", "feedback"],
      starred: false
    },
    {
      id: 3,
      name: "Content Creation",
      description: "Podcast recordings, video scripts, and content brainstorming sessions",
      color: "from-green-500 to-emerald-500",
      transcriptionCount: 35,
      totalDuration: "28h 15m",
      lastUpdated: "1 day ago",
      createdAt: "2023-12-15",
      progress: 92,
      status: "active",
      members: [
        { id: 6, name: "James Kumar", avatar: "JK", role: "Creator" },
        { id: 7, name: "Maria Gonzalez", avatar: "MG", role: "Editor" },
        { id: 8, name: "Alex Thompson", avatar: "AT", role: "Producer" }
      ],
      recentTranscriptions: [
        { id: 7, title: "Podcast Episode 25", date: "1 day ago", duration: "52:33" },
        { id: 8, title: "Video Script Review", date: "2 days ago", duration: "25:14" },
        { id: 9, title: "Content Planning Meeting", date: "4 days ago", duration: "38:45" }
      ],
      tags: ["podcast", "content", "creative"],
      starred: true
    },
    {
      id: 4,
      name: "Legal Documentation",
      description: "Legal meetings, client consultations, and deposition transcriptions",
      color: "from-gray-600 to-gray-700",
      transcriptionCount: 12,
      totalDuration: "15h 22m",
      lastUpdated: "3 days ago",
      createdAt: "2024-01-10",
      progress: 40,
      status: "paused",
      members: [
        { id: 9, name: "Jennifer Law", avatar: "JL", role: "Attorney" },
        { id: 10, name: "Robert Smith", avatar: "RS", role: "Paralegal" }
      ],
      recentTranscriptions: [
        { id: 10, title: "Client Consultation #5", date: "3 days ago", duration: "1:15:30" },
        { id: 11, title: "Case Strategy Meeting", date: "5 days ago", duration: "45:22" },
        { id: 12, title: "Deposition Review", date: "1 week ago", duration: "2:05:15" }
      ],
      tags: ["legal", "confidential", "documentation"],
      starred: false
    },
    {
      id: 5,
      name: "Training Sessions",
      description: "Employee onboarding, workshop recordings, and training materials",
      color: "from-orange-500 to-red-500",
      transcriptionCount: 8,
      totalDuration: "6h 45m",
      lastUpdated: "1 week ago",
      createdAt: "2023-12-20",
      progress: 100,
      status: "completed",
      members: [
        { id: 11, name: "David Wilson", avatar: "DW", role: "Trainer" },
        { id: 12, name: "Anna Martinez", avatar: "AM", role: "HR Manager" }
      ],
      recentTranscriptions: [
        { id: 13, title: "New Employee Orientation", date: "1 week ago", duration: "1:30:00" },
        { id: 14, title: "Skills Workshop", date: "2 weeks ago", duration: "2:15:30" },
        { id: 15, title: "Team Building Session", date: "3 weeks ago", duration: "1:45:15" }
      ],
      tags: ["training", "onboarding", "workshops"],
      starred: false
    }
  ];

  // Use real data if available, fallback to mock for demo
  const displayProjects = projects.length > 0 ? projects : mockProjects;

  // Utility functions
  const formatDurationFromSeconds = (seconds) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
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

  const filteredProjects = displayProjects.filter(project => {
    // Handle both real data and mock data structures
    const name = project.name || project.title || '';
    const description = project.description || '';
    const tags = project.tags || [];
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(tags) && tags.some(tag => {
                           const tagName = typeof tag === 'string' ? tag : tag.name;
                           return tagName.toLowerCase().includes(searchTerm.toLowerCase());
                         }));
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'starred' && project.starred) ||
                         (filterBy === 'active' && project.status === 'active') ||
                         (filterBy === 'completed' && project.status === 'completed') ||
                         (filterBy === 'paused' && project.status === 'paused');
    
    return matchesSearch && matchesFilter;
  });

  const toggleSelection = (id) => {
    setSelectedProjects(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'completed': return 'text-blue-400 bg-blue-400/10';
      case 'paused': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const totalStats = {
    projects: stats.totalProjects || displayProjects.length,
    transcriptions: stats.totalTranscriptions || displayProjects.reduce((sum, p) => sum + (p.transcriptionCount || 0), 0),
    totalTime: formatDurationFromSeconds(stats.totalDuration) || "0h 0m",
    activeProjects: stats.activeProjects || displayProjects.filter(p => p.status === 'active').length
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your projects...</p>
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
              Projects 📁
            </h1>
            <p className="text-gray-400 text-lg">
              Organize your transcriptions into collaborative projects
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedProjects.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-2"
              >
                <span className="text-white text-sm">{selectedProjects.length} selected</span>
                <button className="p-1 hover:bg-gray-700/50 rounded">
                  <Share2 className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-700/50 rounded">
                  <Archive className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-700/50 rounded">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </motion.div>
            )}
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              <FolderPlus className="h-5 w-5" />
              New Project
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
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
            <option value="all">All Projects</option>
            <option value="starred">Starred</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="name">By Name</option>
            <option value="transcriptions">By Transcriptions</option>
            <option value="progress">By Progress</option>
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
          { label: 'Total Projects', value: totalStats.projects, icon: Folder, color: 'from-gray-700 to-gray-800' },
          { label: 'Total Transcriptions', value: totalStats.transcriptions, icon: FileText, color: 'from-purple-500 to-gray-800' },
          { label: 'Total Duration', value: totalStats.totalTime, icon: Clock, color: 'from-green-500 to-gray-800' },
          { label: 'Active Projects', value: totalStats.activeProjects, icon: TrendingUp, color: 'from-blue-500 to-gray-800' }
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

      {/* Projects Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {filteredProjects.length} Project{filteredProjects.length !== 1 ? 's' : ''}
            </h2>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  viewMode === 'grid' ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                )}
              >
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  {[...Array(4)].map((_, i) => <div key={i} className="bg-current rounded-sm" />)}
                </div>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  viewMode === 'list' ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                )}
              >
                <div className="space-y-1 w-4 h-4">
                  {[...Array(3)].map((_, i) => <div key={i} className="bg-current h-1 rounded-sm" />)}
                </div>
              </button>
            </div>
          </div>

          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          )}>
            <AnimatePresence>
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "group p-6 bg-black/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 cursor-pointer",
                    selectedProjects.includes(project.id) && "border-white/30 bg-white/5"
                  )}
                  onClick={() => toggleSelection(project.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => toggleSelection(project.id)}
                          className="rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {project.starred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-4 h-4 bg-gradient-to-r ${project.color} rounded-full`} />
                          <h3 className="text-white font-semibold text-lg group-hover:text-white transition-colors duration-200">
                            {project.name || project.title || 'Untitled Project'}
                          </h3>
                          <div className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
                            getStatusColor(project.status)
                          )}>
                            {project.status}
                          </div>
                        </div>
                        
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                          {project.description || 'No description available'}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-white font-semibold">{project.transcriptionCount || project.transcription_count || 0}</div>
                            <div className="text-gray-400 text-xs">Transcriptions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-semibold">{project.totalDuration || formatDurationFromSeconds(project.total_duration)}</div>
                            <div className="text-gray-400 text-xs">Duration</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-semibold">{(project.members || project.member_count || []).length || 0}</div>
                            <div className="text-gray-400 text-xs">Members</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-semibold">{project.progress || 0}%</div>
                            <div className="text-gray-400 text-xs">Progress</div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-xs">Project Progress</span>
                            <span className="text-white text-xs">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 bg-gradient-to-r ${project.color} rounded-full transition-all duration-500`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex -space-x-2">
                            {project.members.slice(0, 3).map((member, memberIndex) => (
                              <div 
                                key={memberIndex}
                                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs border-2 border-gray-800"
                                title={`${member.name} - ${member.role}`}
                              >
                                {member.avatar}
                              </div>
                            ))}
                            {project.members.length > 3 && (
                              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs border-2 border-gray-800">
                                +{project.members.length - 3}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-gray-400 text-xs">
                            Updated {project.lastUpdated || formatRelativeTime(project.updated_at)}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-gray-400 text-xs mb-1">Recent Activity</div>
                          {(project.recentTranscriptions || project.recent_transcriptions || []).slice(0, 2).map((transcription, transIndex) => (
                            <div key={transIndex} className="flex items-center justify-between py-1 px-2 bg-gray-800/30 rounded text-xs">
                              <span className="text-gray-300">{transcription.title}</span>
                              <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="h-3 w-3" />
                                {transcription.duration || formatDurationFromSeconds(transcription.duration_seconds)}
                              </div>
                            </div>
                          ))}
                          {!(project.recentTranscriptions || project.recent_transcriptions || []).length && (
                            <div className="text-gray-500 text-xs py-2">No recent activity</div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4">
                          {(project.tags || []).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-md"
                            >
                              #{typeof tag === 'string' ? tag : tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
                        <Eye className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
                        <Edit3 className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
                        <UserPlus className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
                        <Share2 className="h-4 w-4 text-gray-400" />
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

export default ProjectsPage;