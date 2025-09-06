"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Bell, 
  Shield, 
  Mic, 
  Globe, 
  Palette,
  Key,
  CreditCard,
  Download,
  Trash2,
  Settings as SettingsIcon,
  Save,
  Eye,
  EyeOff,
  Plus,
  Folder,
  X,
  Check,
  AlertTriangle,
  HelpCircle,
  LogOut,
  Smartphone,
  Monitor,
  Volume2,
  FileText,
  Clock,
  Users,
  Zap,
  Database,
  Server
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProfile, updateProfile } from '@/lib/database';
import SubscriptionPlans from '@/components/payments/subscription-plans';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface UserSettings {
  // API Keys
  assemblyaiApiKey?: string;
  
  // Transcription Preferences
  defaultLanguage: string;
  speakerDiarization: boolean;
  timestamps: boolean;
  punctuation: boolean;
  profanityFilter: boolean;
  autoDeleteAfterDays: number;
  
  // UI Preferences
  theme: 'dark' | 'light' | 'system';
  compactMode: boolean;
  animationsEnabled: boolean;
  
  // Notifications
  emailNotifications: boolean;
  transcriptionCompleted: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
  
  // Privacy
  shareUsageData: boolean;
  allowAnalytics: boolean;
}

const SettingsPage = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const [settings, setSettings] = useState<UserSettings>({
    assemblyaiApiKey: '',
    defaultLanguage: 'en',
    speakerDiarization: true,
    timestamps: true,
    punctuation: true,
    profanityFilter: false,
    autoDeleteAfterDays: 0, // 0 = never delete
    theme: 'dark',
    compactMode: false,
    animationsEnabled: true,
    emailNotifications: true,
    transcriptionCompleted: true,
    weeklyDigest: true,
    securityAlerts: true,
    shareUsageData: false,
    allowAnalytics: false
  });

  const [pendingChanges, setPendingChanges] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'transcription', label: 'Transcription', icon: Mic },
    { id: 'interface', label: 'Interface', icon: Monitor },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data & Export', icon: Download },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' },
    { value: 'hi', label: 'Hindi' },
  ];

  useEffect(() => {
    async function loadUserData() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userProfile = await getProfile(session.user.id);
        if (userProfile) {
          setProfile({
            ...userProfile,
            name: userProfile.name || '',
            avatar_url: userProfile.avatar_url || undefined
          });
        }
        
        // Load settings from localStorage or API
        const savedSettings = localStorage.getItem('voiceflow-settings');
        if (savedSettings) {
          setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [session]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setPendingChanges(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in production, you'd save to your API)
      localStorage.setItem('voiceflow-settings', JSON.stringify(settings));
      setPendingChanges(false);
      
      // Show success message briefly
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const exportData = (format: string) => {
    const data = {
      profile,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceflow-data.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetSettings = () => {
    if (confirm('Reset all settings to default values? This cannot be undone.')) {
      setSettings({
        assemblyaiApiKey: '',
        defaultLanguage: 'en',
        speakerDiarization: true,
        timestamps: true,
        punctuation: true,
        profanityFilter: false,
        autoDeleteAfterDays: 0,
        theme: 'dark',
        compactMode: false,
        animationsEnabled: true,
        emailNotifications: true,
        transcriptionCompleted: true,
        weeklyDigest: true,
        securityAlerts: true,
        shareUsageData: false,
        allowAnalytics: false
      });
      setPendingChanges(true);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
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
              Settings ⚙️
            </h1>
            <p className="text-gray-400 text-lg">
              Customize your Voiceflow experience
            </p>
          </div>
          
          {pendingChanges && (
            <motion.button
              onClick={saveSettings}
              disabled={saving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 sticky top-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <button
                onClick={resetSettings}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Reset Settings</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                    {session?.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-2xl">
                        {session?.user?.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{session?.user?.name}</h2>
                    <p className="text-gray-400">{session?.user?.email}</p>
                    <p className="text-sm text-purple-400">Pro Plan</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue={session?.user?.name || ''}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:border-gray-600/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={session?.user?.email || ''}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:border-gray-600/50 focus:outline-none"
                      disabled
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                      <div>
                        <div className="text-white font-medium">Two-Factor Authentication</div>
                        <div className="text-gray-400 text-sm">Add an extra layer of security</div>
                      </div>
                      <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                        Enable
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                      <div>
                        <div className="text-white font-medium">Active Sessions</div>
                        <div className="text-gray-400 text-sm">Manage your active sessions</div>
                      </div>
                      <button className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                        View All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">API Keys</h2>
                  <p className="text-gray-400">Manage your third-party service integrations</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      AssemblyAI API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.assemblyaiApiKey}
                        onChange={(e) => handleSettingChange('assemblyaiApiKey', e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 pr-12 text-white focus:border-gray-600/50 focus:outline-none"
                        placeholder="Enter your AssemblyAI API key..."
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      Get your API key from{' '}
                      <a 
                        href="https://assemblyai.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        AssemblyAI dashboard
                      </a>
                    </p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <HelpCircle className="h-4 w-4" />
                      <span className="font-medium">Why do I need an API key?</span>
                    </div>
                    <p className="text-blue-300 text-sm">
                      API keys allow Voiceflow to use third-party services for transcription. 
                      Your keys are stored securely and only used for your transcriptions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Transcription Tab */}
            {activeTab === 'transcription' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Transcription Preferences</h2>
                  <p className="text-gray-400">Configure default settings for new transcriptions</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Default Language
                    </label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:border-gray-600/50 focus:outline-none"
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Processing Options</h3>
                    
                    {[
                      { key: 'speakerDiarization', label: 'Speaker Identification', description: 'Identify different speakers in audio' },
                      { key: 'timestamps', label: 'Include Timestamps', description: 'Add time markers to transcriptions' },
                      { key: 'punctuation', label: 'Smart Punctuation', description: 'Automatically add punctuation' },
                      { key: 'profanityFilter', label: 'Profanity Filter', description: 'Filter out inappropriate language' },
                    ].map((option) => (
                      <div key={option.key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                        <div>
                          <div className="text-white font-medium">{option.label}</div>
                          <div className="text-gray-400 text-sm">{option.description}</div>
                        </div>
                        <button
                          onClick={() => handleSettingChange(option.key as keyof UserSettings, !settings[option.key as keyof UserSettings])}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all duration-200 relative",
                            settings[option.key as keyof UserSettings]
                              ? "bg-purple-500"
                              : "bg-gray-600"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200",
                            settings[option.key as keyof UserSettings]
                              ? "left-7"
                              : "left-1"
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Auto-delete Transcriptions
                    </label>
                    <select
                      value={settings.autoDeleteAfterDays}
                      onChange={(e) => handleSettingChange('autoDeleteAfterDays', parseInt(e.target.value))}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:border-gray-600/50 focus:outline-none"
                    >
                      <option value={0}>Never delete</option>
                      <option value={30}>After 30 days</option>
                      <option value={90}>After 90 days</option>
                      <option value={365}>After 1 year</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Interface Tab */}
            {activeTab === 'interface' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Interface Preferences</h2>
                  <p className="text-gray-400">Customize the look and feel of Voiceflow</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'dark', label: 'Dark', icon: '🌙' },
                        { value: 'light', label: 'Light', icon: '☀️' },
                        { value: 'system', label: 'System', icon: '⚙️' },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => handleSettingChange('theme', theme.value)}
                          className={cn(
                            "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                            settings.theme === theme.value
                              ? "border-purple-500 bg-purple-500/10 text-purple-400"
                              : "border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600"
                          )}
                        >
                          <span className="text-lg">{theme.icon}</span>
                          <span className="font-medium">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'compactMode', label: 'Compact Mode', description: 'Use smaller spacing and elements' },
                      { key: 'animationsEnabled', label: 'Animations', description: 'Enable smooth transitions and effects' },
                    ].map((option) => (
                      <div key={option.key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                        <div>
                          <div className="text-white font-medium">{option.label}</div>
                          <div className="text-gray-400 text-sm">{option.description}</div>
                        </div>
                        <button
                          onClick={() => handleSettingChange(option.key as keyof UserSettings, !settings[option.key as keyof UserSettings])}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all duration-200 relative",
                            settings[option.key as keyof UserSettings]
                              ? "bg-purple-500"
                              : "bg-gray-600"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200",
                            settings[option.key as keyof UserSettings]
                              ? "left-7"
                              : "left-1"
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
                  <p className="text-gray-400">Choose what notifications you want to receive</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'transcriptionCompleted', label: 'Transcription Completed', description: 'Get notified when transcriptions finish' },
                    { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Weekly summary of your activity' },
                    { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security notifications' },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                      <div>
                        <div className="text-white font-medium">{option.label}</div>
                        <div className="text-gray-400 text-sm">{option.description}</div>
                      </div>
                      <button
                        onClick={() => handleSettingChange(option.key as keyof UserSettings, !settings[option.key as keyof UserSettings])}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all duration-200 relative",
                          settings[option.key as keyof UserSettings]
                            ? "bg-purple-500"
                            : "bg-gray-600"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200",
                          settings[option.key as keyof UserSettings]
                            ? "left-7"
                            : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Privacy & Data</h2>
                  <p className="text-gray-400">Control how your data is used and shared</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'shareUsageData', label: 'Share Usage Data', description: 'Help improve Voiceflow by sharing anonymous usage data' },
                    { key: 'allowAnalytics', label: 'Analytics & Tracking', description: 'Allow analytics to improve your experience' },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                      <div>
                        <div className="text-white font-medium">{option.label}</div>
                        <div className="text-gray-400 text-sm">{option.description}</div>
                      </div>
                      <button
                        onClick={() => handleSettingChange(option.key as keyof UserSettings, !settings[option.key as keyof UserSettings])}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all duration-200 relative",
                          settings[option.key as keyof UserSettings]
                            ? "bg-purple-500"
                            : "bg-gray-600"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200",
                          settings[option.key as keyof UserSettings]
                            ? "left-7"
                            : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <h3 className="text-red-400 font-medium mb-2">Data Deletion</h3>
                  <p className="text-red-300 text-sm mb-4">
                    Permanently delete all your data from Voiceflow. This action cannot be undone.
                  </p>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                    Delete All Data
                  </button>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h2>
                  <p className="text-gray-400">Manage your subscription and billing information</p>
                </div>

                <SubscriptionPlans />
              </div>
            )}

            {/* Data & Export Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Data & Export</h2>
                  <p className="text-gray-400">Export or manage your data</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => exportData('json')}
                    className="flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-colors duration-200"
                  >
                    <Database className="h-6 w-6 text-purple-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">Export All Data</div>
                      <div className="text-gray-400 text-sm">Download all your data as JSON</div>
                    </div>
                  </button>
                  
                  <button className="flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-colors duration-200">
                    <FileText className="h-6 w-6 text-blue-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">Export Transcriptions</div>
                      <div className="text-gray-400 text-sm">Download all transcriptions</div>
                    </div>
                  </button>
                  
                  <button className="flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-colors duration-200">
                    <Folder className="h-6 w-6 text-green-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">Export Projects</div>
                      <div className="text-gray-400 text-sm">Download project structure</div>
                    </div>
                  </button>
                  
                  <button className="flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-colors duration-200">
                    <Server className="h-6 w-6 text-yellow-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">API Export</div>
                      <div className="text-gray-400 text-sm">Export via API endpoints</div>
                    </div>
                  </button>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Storage Usage</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Audio Files</span>
                      <span className="text-white">2.4 GB / Unlimited</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-1/4"></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Transcriptions</span>
                      <span className="text-white">1,247 files</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;