'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase_client'
import SideBar from '../components/SideBar'
import { useRouter } from 'next/navigation'
import { Camera, Upload, X, Loader2, Search, Tag } from 'lucide-react'

// Import the structured tag system
import { availableTags } from '../../app/profile/build/availableTags'

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const [activeTab, setActiveTab] = useState('profile')
  const router = useRouter()

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    tags: [],
    avatar_url: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Tag system states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth')
          return
        }

        setUser(session.user)
        
        // Fetch profile from database
        const { data: profileData } = await supabase
          .from('profile')
          .select('*')
          .eq('email', session.user.email)
          .single()

        if (profileData) {
          setProfile(profileData)
          setFormData({
            email: profileData.email || '',
            fullName: session.user.user_metadata?.full_name || '',
            tags: profileData.tags || [],
            avatar_url: profileData.avatar_url || ''
          })
          
          // Convert tag names to tag IDs for the structured system
          const tagIds = profileData.tags?.map(tagName => {
            const tag = availableTags.find(t => t.name === tagName)
            return tag ? tag.id : null
          }).filter(Boolean) || []
          
          setSelectedTags(tagIds)
        }

      } catch (error) {
        console.error('Error fetching user data:', error)
        showMessage('Error loading user data', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  // Filter tags based on search query
  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group tags by category
  const groupedTags = filteredTags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = []
    }
    acc[tag.category].push(tag)
    return acc
  }, {})

  const showMessage = (text, type = 'success') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 5000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId))
    } else if (selectedTags.length < 6) {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showMessage('Image size must be less than 5MB', 'error')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        showMessage('Please select an image file', 'error')
        return
      }

      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null

    setAvatarUploading(true)
    try {
      // Generate unique filename with the same structure as ProfileBuilder
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}` // ✅ This matches ProfileBuilder structure

      console.log('Uploading file:', filePath, 'to avatars bucket')

      // Upload file to avatars bucket under the user's UID folder
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        if (uploadError.message?.includes('The resource you requested could not be found')) {
          throw new Error('Storage bucket not accessible. Check RLS policies.')
        } else if (uploadError.message?.includes('not allowed') || uploadError.message?.includes('policy')) {
          throw new Error('Upload permission denied. Check storage RLS policies.')
        } else if (uploadError.message?.includes('JWT')) {
          throw new Error('Authentication issue. Please refresh and try again.')
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }
      }

      if (!uploadData?.path) {
        throw new Error('Upload completed but no file path returned')
      }

      // Get public URL
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path)

      if (urlError) {
        console.error('Public URL error:', urlError)
        throw new Error('Failed to get image URL')
      }

      console.log('Avatar uploaded successfully:', publicUrl)
      return publicUrl

    } catch (error) {
      console.error('Avatar upload error:', error)
      showMessage(error.message || 'Failed to upload avatar. Please try again.', 'error')
      return null
    } finally {
      setAvatarUploading(false)
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setFormData(prev => ({
      ...prev,
      avatar_url: ''
    }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)

    try {
      // Upload avatar if a new one was selected
      let uploadedAvatarUrl = formData.avatar_url
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar()
        if (newAvatarUrl) {
          uploadedAvatarUrl = newAvatarUrl
        } else {
          setUpdating(false)
          return
        }
      }

      // Convert selected tag IDs to tag names
      const selectedTagNames = selectedTags.map(tagId => {
        const tag = availableTags.find(t => t.id === tagId)
        return tag ? tag.name : null
      }).filter(Boolean)

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        email: formData.email,
        data: {
          full_name: formData.fullName,
          tags: selectedTagNames,
          avatar_url: uploadedAvatarUrl
        }
      })

      if (authError) {
        console.error('Auth update error:', authError)
        throw new Error(authError.message || 'Failed to update user authentication')
      }

      // Update profile in database
      const updateData = {
        email: formData.email,
        tags: selectedTagNames,
        avatar_url: uploadedAvatarUrl
      }
      
      console.log('Updating profile with data:', updateData)
      
      const { error: profileError } = await supabase
        .from('profile')
        .update(updateData)
        .eq('email', user.email) // Use email instead of id for consistency

      if (profileError) {
        console.error('Profile update error:', profileError)
        throw new Error(profileError.message || 'Failed to update profile')
      }

      // Update local state
      setFormData(prev => ({
        ...prev,
        avatar_url: uploadedAvatarUrl,
        tags: selectedTagNames
      }))

      // Update profile state
      setProfile(prev => ({
        ...prev,
        ...updateData
      }))

      // Reset avatar upload states
      setAvatarFile(null)
      setAvatarPreview(null)

      showMessage('Profile updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating profile:', error)
      
      let errorMessage = 'Error updating profile'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      showMessage(errorMessage, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('New passwords do not match', 'error')
      setUpdating(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error')
      setUpdating(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      showMessage('Password updated successfully!', 'success')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error updating password:', error)
      showMessage(error.message || 'Error updating password', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Delete profile from database
        const { error: deleteError } = await supabase
          .from('profile')
          .delete()
          .eq('email', user.email)

        if (deleteError) throw deleteError

        // Sign out user
        await supabase.auth.signOut()
        
        showMessage('Account deleted successfully', 'success')
        router.push('/')
      } catch (error) {
        console.error('Error deleting account:', error)
        showMessage('Error deleting account', 'error')
      }
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 min-h-screen flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="text-4xl font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent animate-pulse">
            BePro Settings
          </div>
          <div className="w-10 h-10 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 min-h-screen font-sans">
      <div className="w-72 fixed bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 top-0 left-0 h-full z-30 border-r border-gray-700">
        <SideBar user={profile} username={profile?.username || 'user'} />
      </div>
      
      <div className="flex-1 pl-72 min-h-screen">
        <div className="max-w-6xl mx-auto py-12 px-8">
          
          {/* Page Header */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 shadow-2xl rounded-2xl p-8 mb-8 border border-gray-700">
            <h1 className="text-4xl font-black mb-2">Settings</h1>
            <p className="text-amber-200 text-lg">Manage your account preferences and profile information</p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl ${messageType === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
              {message}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex space-x-4 bg-gray-900/50 p-2 rounded-xl">
              {['profile', 'password', 'account'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 shadow-lg'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 shadow-2xl rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-black mb-6">Profile Information</h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Avatar Upload Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center overflow-hidden border-4 border-amber-400 shadow-lg">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : formData.avatar_url ? (
                        <img
                          src={formData.avatar_url}
                          alt="Current avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-3xl">
                          {profile?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    
                    {(avatarPreview || formData.avatar_url) && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <label className="cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-amber-500/30">
                      <Camera size={16} />
                      <span className="text-sm">
                        {avatarPreview || formData.avatar_url ? 'Change Avatar' : 'Upload Avatar'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                    
                    {avatarUploading && (
                      <div className="flex items-center gap-2 text-amber-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-amber-200 mt-2">
                    JPG, PNG, GIF up to 5MB
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-amber-200 text-sm font-bold mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-amber-200 text-sm font-bold mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Enhanced Tags Section */}
                <div>
                  <label className="block text-amber-200 text-sm font-bold mb-2 flex items-center gap-2">
                    <Tag size={16} />
                    Interests & Tags
                  </label>
                  
                  {/* Selected Tags Display */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedTags.map((tagId) => {
                        const tag = availableTags.find(t => t.id === tagId)
                        return tag ? (
                          <span
                            key={tagId}
                            className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"
                          >
                            {tag.name}
                            <button
                              type="button"
                              onClick={() => handleTagToggle(tagId)}
                              className="text-gray-900 hover:text-red-600 font-black"
                            >
                              ×
                            </button>
                          </span>
                        ) : null
                      })}
                    </div>
                  )}

                  {/* Tag Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors"
                      placeholder="Search interests..."
                    />
                  </div>

                  {/* Tag Categories */}
                  <div className="max-h-60 overflow-y-auto bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="space-y-4">
                      {Object.entries(groupedTags).map(([category, tags]) => (
                        <div key={category}>
                          <h3 className="font-bold text-amber-200 mb-2 text-sm uppercase tracking-wider">
                            {category}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {tags.map(tag => (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagToggle(tag.id)}
                                className={`px-3 py-2 text-sm rounded-lg border transition-all text-left ${
                                  selectedTags.includes(tag.id)
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 border-yellow-400'
                                    : selectedTags.length >= 6
                                    ? 'bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed'
                                    : 'bg-gray-700 text-gray-200 border-gray-600 hover:border-amber-400 hover:bg-gray-600'
                                }`}
                                disabled={!selectedTags.includes(tag.id) && selectedTags.length >= 6}
                              >
                                {tag.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-xs text-amber-200 mt-2">
                    Select up to 6 interests to personalize your experience ({selectedTags.length}/6)
                  </p>
                </div>

                <div className="bg-amber-500/20 text-amber-200 p-4 rounded-xl border border-amber-500/30">
                  <p className="font-bold mb-2">📧 Username Change Request</p>
                  <p className="text-sm">
                    To change your username, please email us at{' '}
                    <a href="mailto:bepro.sunday@gmail.com" className="text-amber-300 underline font-bold">
                      bepro.sunday@gmail.com
                    </a>
                    {' '}with your current and desired username.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={updating || avatarUploading}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-4 rounded-xl font-black text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 shadow-2xl rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-black mb-6">Change Password</h2>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <label className="block text-amber-200 text-sm font-bold mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors"
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label className="block text-amber-200 text-sm font-bold mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-4 rounded-xl font-black text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 shadow-2xl rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-black mb-6">Account Management</h2>
              
              <div className="space-y-6">
                <div className="bg-red-500/20 text-red-300 p-6 rounded-xl border border-red-500/30">
                  <h3 className="text-xl font-bold mb-4">Danger Zone</h3>
                  <p className="mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                  >
                    Delete Account
                  </button>
                </div>

                <div className="bg-blue-500/20 text-blue-300 p-6 rounded-xl border border-blue-500/30">
                  <h3 className="text-xl font-bold mb-4">Export Data</h3>
                  <p className="mb-4">
                    Download a copy of your data including posts, profile information, and interactions.
                  </p>
                  <button
                    onClick={() => showMessage('Data export feature coming soon!', 'success')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                  >
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}