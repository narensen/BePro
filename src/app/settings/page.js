'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase_client'
import SideBar from '../components/SideBar'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Save,
  AlertCircle,
  Check
} from 'lucide-react'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  const [saveStatus, setSaveStatus] = useState('')
  const router = useRouter()

  const [settings, setSettings] = useState({
    profile: {
      displayName: '',
      email: '',
      bio: '',
      website: '',
      location: '',
      publicProfile: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: true,
      mentionAlerts: true,
      messageAlerts: true,
      communityUpdates: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true,
      allowMessaging: true,
      dataSharing: false
    },
    appearance: {
      theme: 'light',
      language: 'english',
      timezone: 'auto'
    }
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data?.session) {
        router.push('/')
        return
      }
      const session = data.session
      setUser(session.user)
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profile')
          .select('username')
          .eq('email', session.user.email)
          .single()

        const displayUsername = profileData?.username || session.user.user_metadata?.username || 'User'
        setUsername(displayUsername)
        
        setSettings(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            displayName: displayUsername,
            email: session.user.email
          }
        }))
      } catch (error) {
        console.error('Error fetching profile username:', error)
        setUsername(session.user.user_metadata?.username || 'User')
      }
      
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ]

  const ProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
        <input
          type="text"
          value={settings.profile.displayName}
          onChange={(e) => updateSetting('profile', 'displayName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={settings.profile.email}
          readOnly
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
        />
        <p className="text-xs text-gray-500 mt-1">Email cannot be changed from settings</p>
      </div>
      
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
        <textarea
          value={settings.profile.bio}
          onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
          placeholder="Tell us about yourself..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={settings.profile.website}
            onChange={(e) => updateSetting('profile', 'website', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            placeholder="https://yourwebsite.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={settings.profile.location}
            onChange={(e) => updateSetting('profile', 'location', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            placeholder="City, Country"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="publicProfile"
          checked={settings.profile.publicProfile}
          onChange={(e) => updateSetting('profile', 'publicProfile', e.target.checked)}
          className="w-4 h-4 text-amber-400 bg-gray-100 border-gray-300 rounded focus:ring-amber-400"
        />
        <label htmlFor="publicProfile" className="text-sm font-medium text-gray-700">
          Make my profile public
        </label>
      </div>
    </div>
  )

  const NotificationSettings = () => (
    <div className="space-y-6">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <div className="font-medium text-gray-900 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="text-sm text-gray-600">
              {key === 'emailNotifications' && 'Receive updates via email'}
              {key === 'pushNotifications' && 'Browser and mobile notifications'}
              {key === 'weeklyDigest' && 'Weekly summary of activity'}
              {key === 'mentionAlerts' && 'When someone mentions you'}
              {key === 'messageAlerts' && 'Direct messages and replies'}
              {key === 'communityUpdates' && 'Community announcements and events'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => updateSetting('notifications', key, e.target.checked)}
            className="w-4 h-4 text-amber-400 bg-gray-100 border-gray-300 rounded focus:ring-amber-400"
          />
        </div>
      ))}
    </div>
  )

  const PrivacySettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-xl">
        <label className="block text-sm font-bold text-gray-700 mb-3">Profile Visibility</label>
        <div className="space-y-2">
          {['public', 'private', 'connections'].map((option) => (
            <label key={option} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="profileVisibility"
                value={option}
                checked={settings.privacy.profileVisibility === option}
                onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
                className="w-4 h-4 text-amber-400"
              />
              <span className="text-sm capitalize">{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      {Object.entries(settings.privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="font-medium text-gray-900 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </div>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => updateSetting('privacy', key, e.target.checked)}
            className="w-4 h-4 text-amber-400 bg-gray-100 border-gray-300 rounded focus:ring-amber-400"
          />
        </div>
      ))}
    </div>
  )

  const AppearanceSettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-xl">
        <label className="block text-sm font-bold text-gray-700 mb-3">Theme</label>
        <div className="space-y-2">
          {['light', 'dark', 'auto'].map((option) => (
            <label key={option} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value={option}
                checked={settings.appearance.theme === option}
                onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                className="w-4 h-4 text-amber-400"
              />
              <span className="text-sm capitalize">{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-xl">
        <label className="block text-sm font-bold text-gray-700 mb-3">Language</label>
        <select
          value={settings.appearance.language}
          onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="english">English</option>
          <option value="spanish">Spanish</option>
          <option value="french">French</option>
          <option value="german">German</option>
        </select>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-xl">
        <label className="block text-sm font-bold text-gray-700 mb-3">Timezone</label>
        <select
          value={settings.appearance.timezone}
          onChange={(e) => updateSetting('appearance', 'timezone', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="auto">Auto-detect</option>
          <option value="utc">UTC</option>
          <option value="pst">PST</option>
          <option value="est">EST</option>
          <option value="cet">CET</option>
        </select>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono">
      <div className="fixed left-0 top-0 h-full z-30 w-72">
        <SideBar user={user} username={username} onSignOut={handleSignOut} />
      </div>

      <div className="ml-72">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-4xl font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent animate-pulse">
                BePro
              </div>
              <div className="w-10 h-10 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen">
            <div className="sticky top-0 bg-white/20 backdrop-blur-md border-b border-white/30 p-6 z-10">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 mb-2">⚙️ Settings</h1>
                  <p className="text-lg text-gray-700 font-medium">
                    Customize your BePro experience
                  </p>
                </div>
                
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-amber-300 font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300 shadow-md disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? (
                    <div className="w-4 h-4 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin"></div>
                  ) : saveStatus === 'saved' ? (
                    <Check size={16} />
                  ) : saveStatus === 'error' ? (
                    <AlertCircle size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                  <div className="flex">
                    <div className="w-64 bg-gray-50/50 border-r border-gray-200/50">
                      <nav className="p-4 space-y-1">
                        {tabs.map((tab) => {
                          const Icon = tab.icon
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === tab.id
                                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900 shadow-md'
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                              }`}
                            >
                              <Icon size={18} />
                              {tab.label}
                            </button>
                          )
                        })}
                      </nav>
                    </div>
                    
                    <div className="flex-1 p-6">
                      {activeTab === 'profile' && <ProfileSettings />}
                      {activeTab === 'notifications' && <NotificationSettings />}
                      {activeTab === 'privacy' && <PrivacySettings />}
                      {activeTab === 'appearance' && <AppearanceSettings />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
