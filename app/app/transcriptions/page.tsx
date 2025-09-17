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
  Users,
  X,
  CheckSquare,
  Square,
  AlertCircle,
  Loader,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserTranscriptions, deleteTranscription, updateTranscription } from '@/lib/database';
import { 
  exportTranscriptionAsTXT, 
  exportTranscriptionAsSRT, 
  exportTranscriptionAsDOCX, 
  exportTranscriptionAsPDF,
  exportMultipleTranscriptions,
  downloadBlob,
  generateExportFilename
} from '@/lib/export';

interface Transcription {
  id: string;
  title: string;
  content: string | null;
  file_name: string;
  file_size: number;
  duration: number | null;
  accuracy: number | null;
  status: 'processing' | 'completed' | 'error' | 'uploading';
  created_at: string;
  updated_at: string;
  user_id: string;
  project_id: string | null;
  language: string;
  file_url: string | null;
  speakers_count: number | null;
}

const TranscriptionsPage = () => {
  const { data: session, status } = useSession();
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('list');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showExportDropdown, setShowExportDropdown] = useState<string | null>(null);

  useEffect(() => {
    async function loadTranscriptions() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserTranscriptions(session.user.id, 100);
        setTranscriptions(data);
      } catch (error) {
        console.error('Failed to load transcriptions:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status !== 'loading') {
      loadTranscriptions();
    }
  }, [session, status]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportDropdown) {
        setShowExportDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  // Filter and sort transcriptions
  const filteredTranscriptions = transcriptions
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.file_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'completed' && t.status === 'completed') ||
                           (filterBy === 'processing' && t.status === 'processing') ||
                           (filterBy === 'error' && t.status === 'error');
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        case 'accuracy':
          return (b.accuracy || 0) - (a.accuracy || 0);
        default:
          return 0;
      }
    });

  const handleSelectAll = () => {
    if (selectedItems.size === filteredTranscriptions.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredTranscriptions.map(t => t.id)));
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

  const handleDelete = async (id: string) => {
    try {
      await deleteTranscription(id);
      setTranscriptions(prev => prev.filter(t => t.id !== id));
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(id);
        return newSelected;
      });
    } catch (error) {
      console.error('Failed to delete transcription:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    const confirmDelete = confirm(`Delete ${selectedItems.size} transcription(s)?`);
    if (!confirmDelete) return;

    try {
      await Promise.all(Array.from(selectedItems).map(id => deleteTranscription(id)));
      setTranscriptions(prev => prev.filter(t => !selectedItems.has(t.id)));
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Failed to delete transcriptions:', error);
    }
  };

  const handleEditTitle = async (id: string, title: string) => {
    try {
      await updateTranscription(id, { title });
      setTranscriptions(prev => prev.map(t => 
        t.id === id ? { ...t, title } : t
      ));
      setEditingTitle(null);
      setNewTitle('');
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  const handleExportSingle = async (transcription: Transcription, format: 'txt' | 'srt' | 'docx' | 'pdf') => {
    try {
      let blob: Blob;
      
      switch (format) {
        case 'txt':
          blob = exportTranscriptionAsTXT(transcription, { format, includeMetadata: true });
          break;
        case 'srt':
          blob = exportTranscriptionAsSRT(transcription);
          break;
        case 'docx':
          blob = exportTranscriptionAsDOCX(transcription);
          break;
        case 'pdf':
          blob = exportTranscriptionAsPDF(transcription);
          break;
        default:
          return;
      }
      
      const filename = generateExportFilename(transcription.title, format);
      downloadBlob(blob, filename);
      setShowExportDropdown(null);
    } catch (error) {
      console.error('Failed to export transcription:', error);
    }
  };

  const handleBulkExport = async (format: 'txt' | 'srt' | 'docx' | 'pdf') => {
    if (selectedItems.size === 0) return;
    
    try {
      const selectedTranscriptions = transcriptions.filter(t => selectedItems.has(t.id));
      const blob = exportMultipleTranscriptions(selectedTranscriptions, format);
      const filename = generateExportFilename(`transcriptions_export`, format);
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Failed to export transcriptions:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'processing':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'error':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="h-3 w-3" />;
      case 'processing':
        return <Loader className="h-3 w-3 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading transcriptions...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-400 text-lg">Please sign in to view transcriptions</p>
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
              Manage and organize all your transcribed content
            </p>
          </div>
          <motion.a
            href="/app/upload"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            New Transcription
          </motion.a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-white">{transcriptions.length}</div>
            <div className="text-gray-400 text-sm">Total Transcriptions</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-green-400">
              {transcriptions.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-yellow-400">
              {transcriptions.filter(t => t.status === 'processing').length}
            </div>
            <div className="text-gray-400 text-sm">Processing</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-white">
              {Math.round(transcriptions.reduce((sum, t) => sum + (t.accuracy || 0), 0) / transcriptions.length || 0)}%
            </div>
            <div className="text-gray-400 text-sm">Avg Accuracy</div>
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
              placeholder="Search transcriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-gray-600/50 focus:outline-none"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="error">Error</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
            >
              <option value="recent">Recent First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="duration">Duration</option>
              <option value="accuracy">Accuracy</option>
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
              {selectedItems.size} item(s) selected
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-1">
                <button
                  onClick={() => handleBulkExport('txt')}
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 text-sm"
                >
                  <Download className="h-4 w-4" />
                  TXT
                </button>
                <button
                  onClick={() => handleBulkExport('srt')}
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 text-sm"
                >
                  <Download className="h-4 w-4" />
                  SRT
                </button>
                <button
                  onClick={() => handleBulkExport('docx')}
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 text-sm"
                >
                  <Download className="h-4 w-4" />
                  DOCX
                </button>
                <button
                  onClick={() => handleBulkExport('pdf')}
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 text-sm"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </button>
              </div>
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

      {/* Transcriptions List/Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredTranscriptions.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm || filterBy !== 'all' ? 'No transcriptions found' : 'No transcriptions yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterBy !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Upload your first audio file to get started!'
              }
            </p>
            {!searchTerm && filterBy === 'all' && (
              <motion.a
                href="/app/upload"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                Create First Transcription
              </motion.a>
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
                {selectedItems.size === filteredTranscriptions.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Select All ({filteredTranscriptions.length})
              </button>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredTranscriptions.map((transcription, index) => (
                    <motion.div
                      key={transcription.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={cn(
                        "bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border transition-all duration-200",
                        selectedItems.has(transcription.id)
                          ? "border-purple-500/50 bg-purple-500/5"
                          : "border-gray-700/50 hover:border-gray-600/50"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleSelectItem(transcription.id)}
                          className="mt-1"
                        >
                          {selectedItems.has(transcription.id) ? (
                            <CheckSquare className="h-5 w-5 text-purple-400" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400 hover:text-white transition-colors duration-200" />
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              {editingTitle === transcription.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onBlur={() => {
                                      if (newTitle.trim()) {
                                        handleEditTitle(transcription.id, newTitle.trim());
                                      } else {
                                        setEditingTitle(null);
                                        setNewTitle('');
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        if (newTitle.trim()) {
                                          handleEditTitle(transcription.id, newTitle.trim());
                                        } else {
                                          setEditingTitle(null);
                                          setNewTitle('');
                                        }
                                      } else if (e.key === 'Escape') {
                                        setEditingTitle(null);
                                        setNewTitle('');
                                      }
                                    }}
                                    className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-purple-500"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <h3 
                                  className="text-lg font-semibold text-white mb-1 truncate cursor-pointer hover:text-purple-400 transition-colors duration-200"
                                  onClick={() => {
                                    setEditingTitle(transcription.id);
                                    setNewTitle(transcription.title);
                                  }}
                                >
                                  {transcription.title}
                                </h3>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(transcription.duration || 0)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatRelativeTime(transcription.created_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  {transcription.accuracy || 0}%
                                </span>
                                <span className="text-gray-500">
                                  {formatFileSize(transcription.file_size)}
                                </span>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1",
                                getStatusColor(transcription.status)
                              )}>
                                {getStatusIcon(transcription.status)}
                                {transcription.status}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                                  <Play className="h-4 w-4 text-gray-400" />
                                </button>
                                <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                                  <Eye className="h-4 w-4 text-gray-400" />
                                </button>
                                <div className="relative">
                                  <button
                                    onClick={() => setShowExportDropdown(showExportDropdown === transcription.id ? null : transcription.id)}
                                    className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                                  >
                                    <Download className="h-4 w-4 text-gray-400" />
                                  </button>
                                  {showExportDropdown === transcription.id && (
                                    <div className="absolute right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[120px] z-10">
                                      <button
                                        onClick={() => handleExportSingle(transcription, 'txt')}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                                      >
                                        Export as TXT
                                      </button>
                                      <button
                                        onClick={() => handleExportSingle(transcription, 'srt')}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                                      >
                                        Export as SRT
                                      </button>
                                      <button
                                        onClick={() => handleExportSingle(transcription, 'docx')}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                                      >
                                        Export as DOCX
                                      </button>
                                      <button
                                        onClick={() => handleExportSingle(transcription, 'pdf')}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                                      >
                                        Export as PDF
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <button 
                                  onClick={() => handleDelete(transcription.id)}
                                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                                >
                                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Content Preview */}
                          {transcription.content && transcription.status === 'completed' && (
                            <div className="bg-gray-800/30 rounded-lg p-4">
                              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                                {transcription.content}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredTranscriptions.map((transcription, index) => (
                    <motion.div
                      key={transcription.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={cn(
                        "bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border transition-all duration-200",
                        selectedItems.has(transcription.id)
                          ? "border-purple-500/50 bg-purple-500/5"
                          : "border-gray-700/50 hover:border-gray-600/50"
                      )}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <button
                          onClick={() => handleSelectItem(transcription.id)}
                        >
                          {selectedItems.has(transcription.id) ? (
                            <CheckSquare className="h-5 w-5 text-purple-400" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400 hover:text-white transition-colors duration-200" />
                          )}
                        </button>
                        
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1",
                          getStatusColor(transcription.status)
                        )}>
                          {getStatusIcon(transcription.status)}
                          {transcription.status}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        {editingTitle === transcription.id ? (
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onBlur={() => {
                              if (newTitle.trim()) {
                                handleEditTitle(transcription.id, newTitle.trim());
                              } else {
                                setEditingTitle(null);
                                setNewTitle('');
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (newTitle.trim()) {
                                  handleEditTitle(transcription.id, newTitle.trim());
                                } else {
                                  setEditingTitle(null);
                                  setNewTitle('');
                                }
                              } else if (e.key === 'Escape') {
                                setEditingTitle(null);
                                setNewTitle('');
                              }
                            }}
                            className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-purple-500"
                            autoFocus
                          />
                        ) : (
                          <h3 
                            className="text-lg font-semibold text-white mb-2 cursor-pointer hover:text-purple-400 transition-colors duration-200"
                            onClick={() => {
                              setEditingTitle(transcription.id);
                              setNewTitle(transcription.title);
                            }}
                          >
                            {transcription.title}
                          </h3>
                        )}

                        <div className="space-y-2 text-sm text-gray-400">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(transcription.duration || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {transcription.accuracy || 0}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatRelativeTime(transcription.created_at)}
                          </div>
                        </div>

                        {transcription.content && transcription.status === 'completed' && (
                          <p className="text-gray-400 text-sm mt-3 line-clamp-3">
                            {transcription.content}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                        <div className="flex items-center gap-1">
                          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                            <Play className="h-4 w-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                            <Eye className="h-4 w-4 text-gray-400" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setShowExportDropdown(showExportDropdown === transcription.id ? null : transcription.id)}
                              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                            >
                              <Download className="h-4 w-4 text-gray-400" />
                            </button>
                            {showExportDropdown === transcription.id && (
                              <div className="absolute right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[120px] z-10">
                                <button
                                  onClick={() => handleExportSingle(transcription, 'txt')}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                                >
                                  Export as TXT
                                </button>
                                <button
                                  onClick={() => handleExportSingle(transcription, 'srt')}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                                >
                                  Export as SRT
                                </button>
                                <button
                                  onClick={() => handleExportSingle(transcription, 'docx')}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                                >
                                  Export as DOCX
                                </button>
                                <button
                                  onClick={() => handleExportSingle(transcription, 'pdf')}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                                >
                                  Export as PDF
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDelete(transcription.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TranscriptionsPage;