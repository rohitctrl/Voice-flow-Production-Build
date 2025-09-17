"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { 
  Home, 
  Mic, 
  FileText, 
  Settings, 
  FolderOpen, 
  Search,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Clock,
  Star,
  TrendingUp,
  LogOut,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  currentPath?: string;
}

export const AppSidebar = ({ currentPath = '/app' }: AppSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session } = useSession();

  const navItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      href: '/app',
      description: 'Overview & recent activity',
      color: 'from-gray-700 to-gray-800'
    },
    { 
      icon: Mic, 
      label: 'Upload', 
      href: '/app/upload',
      description: 'Upload & transcribe audio',
      color: 'from-blue-500 to-gray-800'
    },
    { 
      icon: FileText, 
      label: 'Transcriptions', 
      href: '/app/transcriptions',
      description: 'View all transcriptions',
      color: 'from-purple-500 to-gray-800'
    },
    { 
      icon: FolderOpen, 
      label: 'Projects', 
      href: '/app/projects',
      description: 'Organize by projects',
      color: 'from-amber-500 to-orange-500'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/app/settings',
      description: 'Preferences & API keys',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  const quickStats = [
    { icon: Clock, value: '24', label: 'This Month', color: 'text-white' },
    { icon: Zap, value: '99.2%', label: 'Accuracy', color: 'text-green-400' },
    { icon: TrendingUp, value: '+15%', label: 'vs Last Month', color: 'text-white' }
  ];

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ 
          width: isCollapsed ? '80px' : '300px',
          x: 0
        }}
        initial={{ width: '300px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 h-full bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 z-50 flex flex-col",
          "md:relative md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <motion.div
              animate={{ opacity: isCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                <Mic className="h-6 w-6 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-white font-bold text-xl">Voiceflow</h1>
                  <p className="text-gray-400 text-xs">AI Transcription</p>
                </div>
              )}
            </motion.div>
            
            <button
              onClick={toggleCollapsed}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Record Button */}
        <div className="p-4 border-b border-gray-700/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full flex items-center gap-3 p-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-300",
              isCollapsed && "justify-center"
            )}
          >
            <PlusCircle className="h-5 w-5" />
            {!isCollapsed && <span>Quick Record</span>}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const isActive = currentPath === item.href;
              
              return (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                    isActive 
                      ? "bg-gradient-to-r from-gray-700/20 to-gray-800/20 border border-gray-700/30" 
                      : "hover:bg-gray-800/50",
                    isCollapsed && "justify-center"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white to-gray-700 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                    isActive ? `bg-gradient-to-r ${item.color}` : "bg-gray-800/50 group-hover:bg-gray-700/50"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors duration-300",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                    )} />
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className={cn(
                        "font-semibold transition-colors duration-300",
                        isActive ? "text-white" : "text-gray-300 group-hover:text-white"
                      )}>
                        {item.label}
                      </div>
                      <div className={cn(
                        "text-xs transition-colors duration-300",
                        isActive ? "text-gray-300" : "text-gray-500 group-hover:text-gray-400"
                      )}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </motion.a>
              );
            })}
          </div>
        </nav>

        {/* Quick Stats */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-4 border-t border-gray-700/50"
          >
            <h3 className="text-white font-semibold mb-3 text-sm">Quick Stats</h3>
            <div className="space-y-3">
              {quickStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-800/50 rounded-lg flex items-center justify-center">
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{stat.value}</div>
                    <div className="text-gray-400 text-xs">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* User Profile */}
        {!isCollapsed && session && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="p-4 border-t border-gray-700/50 relative"
          >
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                {session.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {session.user?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-semibold text-sm truncate">
                  {session.user?.name || 'User'}
                </div>
                <div className="text-gray-400 text-xs">Pro Plan</div>
              </div>
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>

            {/* User Menu Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-4 right-4 mb-2 bg-gray-800 rounded-xl border border-gray-700/50 shadow-xl overflow-hidden z-50"
                >
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 text-gray-400" />
                    <span className="text-white text-sm">Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.aside>
    </>
  );
};