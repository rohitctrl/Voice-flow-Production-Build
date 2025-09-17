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
  Pause,
  Plus,
  X,
  CheckSquare,
  Square,
  AlertCircle,
  Loader,
  Grid3X3,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserProjects, createProject, updateProject, deleteProject, getUserTranscriptions } from '@/lib/database';
import { exportProjectSummary, downloadBlob, generateExportFilename } from '@/lib/export';

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ProjectWithStats extends Project {
  transcriptionCount: number;
  totalDuration: number;
  lastActivity: string;
}

const ProjectsPage = () => {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Create/Edit form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#8b5cf6' // Default purple
  });

  const projectColors = [
    '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
    '#ec4899', '#6366f1', '#84cc16', '#f97316', '#14b8a6'
  ];

  useEffect(() => {
    async function loadProjects() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const projectsData = await getUserProjects(session.user.id);
        const transcriptions = await getUserTranscriptions(session.user.id, 1000);
        
        // Calculate stats for each project
        const projectsWithStats: ProjectWithStats[] = projectsData.map(project => {
          const projectTranscriptions = transcriptions.filter(t => t.project_id === project.id);
          const totalDuration = projectTranscriptions.reduce((sum, t) => sum + (t.duration || 0), 0);
          const lastTranscription = projectTranscriptions.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];
          
          return {
            ...project,
            transcriptionCount: projectTranscriptions.length,
            totalDuration,
            lastActivity: lastTranscription?.created_at || project.updated_at
          };
        });
        
        setProjects(projectsWithStats);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status !== 'loading') {
      loadProjects();
    }
  }, [session, status]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'transcriptions':
          return b.transcriptionCount - a.transcriptionCount;
        default:
          return 0;
      }
    });

  const handleCreateProject = async () => {
    if (!session?.user?.id || !formData.name.trim()) return;

    try {
      const newProject = await createProject({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color,
        user_id: session.user.id,
        is_archived: false
      });

      if (newProject) {
        setProjects(prev => [{
          ...newProject,
          transcriptionCount: 0,
          totalDuration: 0,
          lastActivity: newProject.created_at
        }, ...prev]);
        
        setShowCreateModal(false);
        setFormData({ name: '', description: '', color: '#8b5cf6' });
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleEditProject = async () => {
    if (!editingProject || !formData.name.trim()) return;

    try {
      const updatedProject = await updateProject(editingProject.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color
      });

      if (updatedProject) {
        setProjects(prev => prev.map(p => 
          p.id === editingProject.id 
            ? { ...p, ...updatedProject }
            : p
        ));
        
        setEditingProject(null);
        setFormData({ name: '', description: '', color: '#8b5cf6' });
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const confirmDelete = confirm(
      `Delete "${project.name}"? This will remove the project but keep all transcriptions.`
    );
    if (!confirmDelete) return;

    try {
      const success = await deleteProject(projectId);
      if (success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setSelectedItems(prev => {
          const newSelected = new Set(prev);
          newSelected.delete(projectId);
          return newSelected;
        });
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredProjects.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    const confirmDelete = confirm(`Delete ${selectedItems.size} project(s)?`);
    if (!confirmDelete) return;

    try {
      await Promise.all(Array.from(selectedItems).map(id => deleteProject(id)));
      setProjects(prev => prev.filter(p => !selectedItems.has(p.id)));
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Failed to delete projects:', error);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: '', description: '', color: '#8b5cf6' });
    setShowCreateModal(true);
  };

  const openEditModal = (project: Project) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color
    });
    setEditingProject(project);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleExportProject = async (project: Project & { transcriptionCount?: number; totalDuration?: number }) => {
    try {
      // Get all transcriptions for this project
      const allTranscriptions = await getUserTranscriptions(session?.user?.id || '', 1000);
      const projectTranscriptions = allTranscriptions.filter(t => t.project_id === project.id);
      
      const projectWithTranscriptions = {
        ...project,
        transcriptions: projectTranscriptions
      };
      
      const blob = exportProjectSummary(projectWithTranscriptions);
      const filename = generateExportFilename(`${project.name}_summary`, 'txt');
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Failed to export project:', error);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-400 text-lg">Please sign in to view projects</p>
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
              Organize your transcriptions into meaningful projects
            </p>
          </div>
          <motion.button
            onClick={openCreateModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            New Project
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-white">{projects.length}</div>
            <div className="text-gray-400 text-sm">Total Projects</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-blue-400">
              {projects.reduce((sum, p) => sum + p.transcriptionCount, 0)}
            </div>
            <div className="text-gray-400 text-sm">Total Transcriptions</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-green-400">
              {formatDuration(projects.reduce((sum, p) => sum + p.totalDuration, 0))}
            </div>
            <div className="text-gray-400 text-sm">Total Duration</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-purple-400">
              {projects.filter(p => p.transcriptionCount > 0).length}
            </div>
            <div className="text-gray-400 text-sm">Active Projects</div>
          </div>
        </div>
      </motion.div>

      {/* Search and Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-gray-600/50 focus:outline-none"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
            >
              <option value="recent">Recent Activity</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="transcriptions">Most Transcriptions</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center bg-gray-800/50 border border-gray-700/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  viewMode === 'list' 
                    ? "bg-purple-500 text-white" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  viewMode === 'grid' 
                    ? "bg-purple-500 text-white" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50"
          >
            <div className="text-white">
              {selectedItems.size} project(s) selected
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Projects List/Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredProjects.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
            <Folder className="h-16 w-16 text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first project to organize transcriptions!'
              }
            </p>
            {!searchTerm && (
              <motion.button
                onClick={openCreateModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                Create First Project
              </motion.button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center gap-3 px-2">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                {selectedItems.size === filteredProjects.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Select All ({filteredProjects.length})
              </button>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={cn(
                        "bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border transition-all duration-200 group",
                        selectedItems.has(project.id)
                          ? "border-purple-500/50 bg-purple-500/5"
                          : "border-gray-700/50 hover:border-gray-600/50"
                      )}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleSelectItem(project.id)}
                          >
                            {selectedItems.has(project.id) ? (
                              <CheckSquare className="h-5 w-5 text-purple-400" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400 hover:text-white transition-colors duration-200" />
                            )}
                          </button>
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => openEditModal(project)}
                            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                          >
                            <Edit3 className="h-4 w-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleExportProject(project)}
                            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                          >
                            <Download className="h-4 w-4 text-gray-400" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                            {project.description}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-white font-medium">{project.transcriptionCount}</div>
                            <div className="text-gray-400">Transcriptions</div>
                          </div>
                          <div>
                            <div className="text-white font-medium">{formatDuration(project.totalDuration)}</div>
                            <div className="text-gray-400">Duration</div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-4 border-t border-gray-700/50 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {formatRelativeTime(project.lastActivity)}
                        </div>
                        <button className="text-gray-400 hover:text-white transition-colors duration-200">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={cn(
                        "bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border transition-all duration-200 group",
                        selectedItems.has(project.id)
                          ? "border-purple-500/50 bg-purple-500/5"
                          : "border-gray-700/50 hover:border-gray-600/50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleSelectItem(project.id)}
                        >
                          {selectedItems.has(project.id) ? (
                            <CheckSquare className="h-5 w-5 text-purple-400" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400 hover:text-white transition-colors duration-200" />
                          )}
                        </button>

                        {/* Color */}
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {project.name}
                              </h3>
                              {project.description && (
                                <p className="text-gray-400 text-sm mb-2">
                                  {project.description}
                                </p>
                              )}
                              <div className="flex items-center gap-6 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {project.transcriptionCount} transcriptions
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(project.totalDuration)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatRelativeTime(project.lastActivity)}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button 
                                onClick={() => openEditModal(project)}
                                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                              >
                                <Edit3 className="h-4 w-4 text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleExportProject(project)}
                                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                              >
                                <Download className="h-4 w-4 text-gray-400" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProject(project.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                              </button>
                              <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingProject) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-2xl border border-gray-700/50 p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProject(null);
                    setFormData({ name: '', description: '', color: '#8b5cf6' });
                  }}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:border-gray-600/50 focus:outline-none"
                    placeholder="Enter project name..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:border-gray-600/50 focus:outline-none"
                    placeholder="Enter project description..."
                    rows={3}
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Color
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {projectColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all duration-200",
                          formData.color === color 
                            ? "border-white scale-110" 
                            : "border-gray-600 hover:border-gray-400"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-700/50">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProject(null);
                    setFormData({ name: '', description: '', color: '#8b5cf6' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editingProject ? handleEditProject : handleCreateProject}
                  disabled={!formData.name.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;