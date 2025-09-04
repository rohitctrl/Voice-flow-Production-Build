"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Moon,
  Sun,
  Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Profile Settings
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: '',
      timezone: 'America/New_York',
      language: 'en'
    },
    
    // Audio Settings
    audio: {
      autoplay: true,
      defaultQuality: 'high',
      noiseReduction: true,
      speakerDiarization: true,
      timestampsEnabled: true,
      confidenceThreshold: 85
    },
    
    // Notifications
    notifications: {
      transcriptionComplete: true,
      projectUpdates: true,
      teamInvites: true,
      weeklyDigest: true,
      emailNotifications: true,
      pushNotifications: false,
      desktopNotifications: true
    },
    
    // Privacy & Security
    privacy: {
      shareAnalytics: false,
      allowTeamAccess: true,
      autoDeleteAfter: '90',
      encryptTranscriptions: true,
      twoFactorEnabled: false
    },
    
    // Appearance
    appearance: {
      theme: 'dark',
      fontSize: 'medium',
      compactView: false,
      showTimestamps: true,
      highlightSpeakers: true
    },
    
    // Integrations
    integrations: {
      googleDrive: false,
      dropbox: false,
      slack: false,
      notion: false,
      zapier: false
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data & Storage', icon: Download }
  ];

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={cn(
        "w-12 h-6 rounded-full transition-all duration-200 relative",
        enabled ? "bg-purple-500" : "bg-gray-600"
      )}
    >
      <div className={cn(
        "w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200",
        enabled ? "left-7" : "left-1"
      )} />
    </button>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
          Settings ⚙️
        </h1>
        <p className="text-gray-400 text-lg">
          Customize your Voiceflow experience and preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 sticky top-8">
            <nav className="space-y-2">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
                
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {settings.profile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 mb-2">
                      Change Photo
                    </button>
                    <p className="text-gray-400 text-sm">Upload a new profile picture</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Timezone</label>
                    <select
                      value={settings.profile.timezone}
                      onChange={(e) => updateSetting('profile', 'timezone', e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
                    >
                      <option value="America/New_York">Eastern Time (UTC-5)</option>
                      <option value="America/Chicago">Central Time (UTC-6)</option>
                      <option value="America/Denver">Mountain Time (UTC-7)</option>
                      <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                      <option value="Europe/London">London (UTC+0)</option>
                      <option value="Europe/Berlin">Berlin (UTC+1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Language</label>
                    <select
                      value={settings.profile.language}
                      onChange={(e) => updateSetting('profile', 'language', e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>

                {/* Password Change */}
                <div className="border-t border-gray-700/50 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 pr-12 text-white focus:border-gray-600/50 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Settings */}
            {activeTab === 'audio' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Audio & Transcription Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Auto-play Transcriptions</h4>
                      <p className="text-gray-400 text-sm">Automatically play audio when viewing transcriptions</p>
                    </div>
                    <ToggleSwitch 
                      enabled={settings.audio.autoplay}
                      onChange={() => updateSetting('audio', 'autoplay', !settings.audio.autoplay)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Noise Reduction</h4>
                      <p className="text-gray-400 text-sm">Apply AI noise reduction to improve transcription accuracy</p>
                    </div>
                    <ToggleSwitch 
                      enabled={settings.audio.noiseReduction}
                      onChange={() => updateSetting('audio', 'noiseReduction', !settings.audio.noiseReduction)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Speaker Identification</h4>
                      <p className="text-gray-400 text-sm">Automatically identify and label different speakers</p>
                    </div>
                    <ToggleSwitch 
                      enabled={settings.audio.speakerDiarization}
                      onChange={() => updateSetting('audio', 'speakerDiarization', !settings.audio.speakerDiarization)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Timestamps</h4>
                      <p className="text-gray-400 text-sm">Include timestamps in transcriptions</p>
                    </div>
                    <ToggleSwitch 
                      enabled={settings.audio.timestampsEnabled}
                      onChange={() => updateSetting('audio', 'timestampsEnabled', !settings.audio.timestampsEnabled)}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Default Audio Quality</label>
                    <select
                      value={settings.audio.defaultQuality}
                      onChange={(e) => updateSetting('audio', 'defaultQuality', e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
                    >
                      <option value="high">High Quality (Recommended)</option>
                      <option value="medium">Medium Quality</option>
                      <option value="low">Low Quality (Faster Processing)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Confidence Threshold</label>
                    <p className="text-gray-400 text-sm mb-3">Minimum confidence level for transcription words ({settings.audio.confidenceThreshold}%)</p>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={settings.audio.confidenceThreshold}
                      onChange={(e) => updateSetting('audio', 'confidenceThreshold', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'transcriptionComplete', label: 'Transcription Complete', desc: 'Get notified when your transcriptions are ready' },
                        { key: 'projectUpdates', label: 'Project Updates', desc: 'Updates about shared projects you\'re part of' },
                        { key: 'teamInvites', label: 'Team Invitations', desc: 'When someone invites you to collaborate' },
                        { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your activity and insights' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{item.label}</h4>
                            <p className="text-gray-400 text-sm">{item.desc}</p>
                          </div>
                          <ToggleSwitch 
                            enabled={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                            onChange={() => updateSetting('notifications', item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-700/50 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'pushNotifications', label: 'Mobile Push Notifications', desc: 'Receive notifications on your mobile device' },
                        { key: 'desktopNotifications', label: 'Desktop Notifications', desc: 'Show notifications in your browser' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{item.label}</h4>
                            <p className="text-gray-400 text-sm">{item.desc}</p>
                          </div>
                          <ToggleSwitch 
                            enabled={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                            onChange={() => updateSetting('notifications', item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Privacy & Security</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                      <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                      {settings.privacy.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Encrypt Transcriptions</h4>
                      <p className="text-gray-400 text-sm">Encrypt your transcriptions for maximum security</p>
                    </div>
                    <ToggleSwitch 
                      enabled={settings.privacy.encryptTranscriptions}
                      onChange={() => updateSetting('privacy', 'encryptTranscriptions', !settings.privacy.encryptTranscriptions)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Allow Team Access</h4>
                      <p className="text-gray-400 text-sm">Let team members access your shared projects</p>
                    </div>
                    <ToggleSwitch 
                      enabled={settings.privacy.allowTeamAccess}
                      onChange={() => updateSetting('privacy', 'allowTeamAccess', !settings.privacy.allowTeamAccess)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Share Analytics</h4>
                      <p className="text-gray-400 text-sm">Help improve Voiceflow by sharing anonymous usage data</p>
                    </div>
                    <ToggleSwitch 
                      enabled={settings.privacy.shareAnalytics}
                      onChange={() => updateSetting('privacy', 'shareAnalytics', !settings.privacy.shareAnalytics)}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Auto-delete Transcriptions</label>
                    <p className="text-gray-400 text-sm mb-3">Automatically delete old transcriptions for privacy</p>
                    <select
                      value={settings.privacy.autoDeleteAfter}
                      onChange={(e) => updateSetting('privacy', 'autoDeleteAfter', e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-gray-600/50 focus:outline-none"
                    >
                      <option value="never">Never</option>
                      <option value="30">After 30 days</option>
                      <option value="90">After 90 days</option>
                      <option value="365">After 1 year</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Appearance Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'auto'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => updateSetting('appearance', 'theme', theme)}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all duration-200 capitalize",
                            settings.appearance.theme === theme
                              ? "border-purple-500 bg-purple-500/10"
                              : "border-gray-700 hover:border-gray-600"
                          )}
                        >
                          <div className="flex items-center justify-center gap-2 text-white">
                            {theme === 'light' && <Sun className="h-5 w-5" />}
                            {theme === 'dark' && <Moon className="h-5 w-5" />}
                            {theme === 'auto' && <Monitor className="h-5 w-5" />}
                            {theme}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-3">Font Size</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['small', 'medium', 'large'].map((size) => (
                        <button
                          key={size}
                          onClick={() => updateSetting('appearance', 'fontSize', size)}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all duration-200 capitalize text-white",
                            settings.appearance.fontSize === size
                              ? "border-purple-500 bg-purple-500/10"
                              : "border-gray-700 hover:border-gray-600"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'compactView', label: 'Compact View', desc: 'Show more content in less space' },
                      { key: 'showTimestamps', label: 'Show Timestamps', desc: 'Display timestamps in transcriptions by default' },
                      { key: 'highlightSpeakers', label: 'Highlight Speakers', desc: 'Use colors to distinguish different speakers' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{item.label}</h4>
                          <p className="text-gray-400 text-sm">{item.desc}</p>
                        </div>
                        <ToggleSwitch 
                          enabled={settings.appearance[item.key as keyof typeof settings.appearance] as boolean}
                          onChange={() => updateSetting('appearance', item.key, !settings.appearance[item.key as keyof typeof settings.appearance])}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Add other tab content similarly... */}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-700/50 mt-8">
              <button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105">
                <Save className="h-5 w-5" />
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;