'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase_client'

import SideBar from '../components/SideBar'
import { useRouter } from 'next/navigation'
import { Camera, Upload, X, Loader2, Search, Tag } from 'lucide-react'
import { availableTags } from '../../app/profile/build/availableTags'

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    tags: [],
    avatar_url: '',
    github_url: '',
    x_url: '',
    location: '',
    university: '',
    work_experience: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
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
            avatar_url: profileData.avatar_url || '',
            github_url: profileData.github_url || '',
            x_url: profileData.x_url || '',
            location: profileData.location || '',
            university: profileData.university || '',
            work_experience: profileData.work_experience || ''
          })
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
  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.category.toLowerCase().includes(searchQuery.toLowerCase())
  )
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

      if (file.size > 5 * 1024 * 1024) {
        showMessage('Image size must be less than 5MB', 'error')
        return
      }

      if (!file.type.startsWith('image/')) {
        showMessage('Please select an image file', 'error')
        return
      }
      setAvatarFile(file)

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

      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
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
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path)

      if (urlError) {
        throw new Error('Failed to get image URL')
      }

      return publicUrl
    } catch (error) {
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
      const selectedTagNames = selectedTags.map(tagId => {
        const tag = availableTags.find(t => t.id === tagId)
        return tag ? tag.name : null
      }).filter(Boolean)
      const { error: authError } = await supabase.auth.updateUser({
        email: formData.email,
        data: {
          full_name: formData.fullName,
          tags: selectedTagNames,
          avatar_url: uploadedAvatarUrl
        }
      })
      if (authError) {
        throw new Error(authError.message || 'Failed to update user authentication')
      }
      const updateData = {
        email: formData.email,
        tags: selectedTagNames,
        avatar_url: uploadedAvatarUrl,
        github_url: formData.github_url || null,
        x_url: formData.x_url || null,
        location: formData.location || null,
        university: formData.university || null,
        work_experience: formData.work_experience || null
      }

      const { error: profileError } = await supabase
        .from('profile')
        .update(updateData)
        .eq('email', user.email)

      if (profileError) {
        throw new Error(profileError.message || 'Failed to update profile')
      }
      setFormData(prev => ({
        ...prev,
        avatar_url: uploadedAvatarUrl,
        tags: selectedTagNames
      }))

      setProfile(prev => ({
        ...prev,
        ...updateData
      }))

      setAvatarFile(null)
      setAvatarPreview(null)
      showMessage('Profile updated successfully!', 'success')
    } catch (error) {
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
      showMessage(error.message || 'Error updating password', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {

        const { error: deleteError } = await supabase
          .from('profile')
          .delete()
          .eq('email', user.email)

        if (deleteError) throw deleteError
        await supabase.auth.signOut()
        showMessage('Account deleted successfully', 'success')
        router.push('/')
      } catch (error) {
        showMessage('Error deleting account', 'error')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
        <SideBar />
        <div className="lg:ml-72 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-2xl lg:text-4xl font-black mb-4 lg:mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent animate-pulse mt-16 lg:mt-0">
              BePro Settings
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
      {}
      <SideBar />
      
      {}
      <div className="transition-all duration-300 ease-in-out min-h-screen pb-20 pt-16 lg:pt-0 lg:pb-0 lg:ml-72">
        {}
        <div className="hidden lg:block sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 p-3 lg:p-6">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl lg:text-4xl font-black text-gray-900 mb-1 lg:mb-2">Settings</h1>
            <p className="text-amber-600 text-sm lg:text-lg font-medium">Manage your account preferences and profile information</p>
          </div>
        </div>

        {}
        <div className="px-3 lg:px-8 py-4 lg:py-8">
          <div className="max-w-4xl mx-auto">
            {}
            <div className="lg:hidden mb-6 text-center">
              <h1 className="text-3xl font-black text-gray-900 mb-2">Settings</h1>
              <p className="text-amber-600 font-medium">Manage your account preferences and profile information</p>
            </div>
            
            {message && (
              <div className={`mb-4 lg:mb-6 p-3 lg:p-4 rounded-xl ${messageType === 'success' ? 'bg-green-500/20 text-green-700 border border-green-500/30' : 'bg-red-500/20 text-red-700 border border-red-500/30'}`}>
                <p className="text-sm lg:text-base font-medium text-center">{message}</p>
              </div>
            )}

            {}
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-4 bg-gray-900/50 p-2 rounded-xl">
                {['profile', 'password', 'account'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-bold transition-all duration-300 text-sm lg:text-base ${
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

            {}
            {activeTab === 'profile' && (
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 shadow-2xl rounded-2xl p-4 lg:p-8 border border-gray-700">
                <h2 className="text-xl lg:text-2xl font-black mb-4 lg:mb-6">Profile Information</h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-4 lg:space-y-6">
                  {}
                  <div className="flex flex-col items-center mb-4 lg:mb-6">
                    <div className="relative mb-3 lg:mb-4">
                      <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center overflow-hidden border-4 border-amber-400 shadow-lg">
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
                          <span className="text-white font-bold text-2xl lg:text-3xl">
                            {profile?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      {(avatarPreview || formData.avatar_url) && (
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-red-500 text-white rounded-full w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-amber-500/30 text-sm lg:text-base">
                        <Camera size={16} />
                        <span>
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
                    <p className="text-xs text-amber-200 mt-2 text-center">
                      JPG, PNG, GIF up to 5MB
                    </p>
                  </div>

                  {}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label className="block text-amber-200 text-sm font-bold mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors text-sm lg:text-base"
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
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors text-sm lg:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-200 text-sm font-bold mb-2">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        name="github_url"
                        value={formData.github_url || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors text-sm lg:text-base"
                        placeholder="https://github.com/yourprofile"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-200 text-sm font-bold mb-2">
                        X URL
                      </label>
                      <input
                        type="url"
                        name="x_url"
                        value={formData.x_url || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors text-sm lg:text-base"
                        placeholder="https://x.com/yourprofile"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-200 text-sm font-bold mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors text-sm lg:text-base"
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-200 text-sm font-bold mb-2">
                        University
                      </label>
                      <input
                        type="text"
                        name="university"
                        value={formData.university || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors text-sm lg:text-base"
                        placeholder="Your University"
                      />
                    </div>
                  </div>

                  {}
                  <div>
                    <label className="block text-amber-200 text-sm font-bold mb-2 flex items-center gap-2">
                      <Tag size={16} />
                      Interests & Tags
                    </label>
                    
                    {}
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedTags.map((tagId) => {
                          const tag = availableTags.find(t => t.id === tagId)
                          return tag ? (
                            <span
                              key={tagId}
                              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-bold flex items-center gap-2"
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

                    {}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 lg:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors text-sm lg:text-base"
                        placeholder="Search interests..."
                      />
                    </div>

                    {}
                    <div className="max-h-48 lg:max-h-60 overflow-y-auto bg-gray-800/50 rounded-xl p-3 lg:p-4 border border-gray-700">
                      <div className="space-y-3 lg:space-y-4">
                        {Object.entries(groupedTags).map(([category, tags]) => (
                          <div key={category}>
                            <h3 className="font-bold text-amber-200 mb-2 text-xs lg:text-sm uppercase tracking-wider">
                              {category}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {tags.map(tag => (
                                <button
                                  key={tag.id}
                                  type="button"
                                  onClick={() => handleTagToggle(tag.id)}
                                  className={`px-2 lg:px-3 py-2 text-xs lg:text-sm rounded-lg border transition-all text-left ${
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

                  {}
                  <div className="bg-amber-500/20 text-amber-200 p-3 lg:p-4 rounded-xl border border-amber-500/30">
                    <p className="font-bold mb-2 text-sm lg:text-base">📧 Username Change Request</p>
                    <p className="text-xs lg:text-sm">
                      To change your username, please email us at{' '}
                      <a href="mailto:bepro.sunday@gmail.com" className="text-amber-300 underline font-bold">
                        bepro.sunday@gmail.com
                      </a>
                      {' '}with your current and desired username.
                    </p>
                  </div>

                  {}
                  <button
                    type="submit"
                    disabled={updating || avatarUploading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-3 lg:py-4 rounded-xl font-black text-base lg:text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {}
            {activeTab === 'password' && (
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 shadow-2xl rounded-2xl p-4 lg:p-8 border border-gray-700">
                <h2 className="text-xl lg:text-2xl font-black mb-4 lg:mb-6">Change Password</h2>
                
                <form onSubmit={handlePasswordUpdate} className="space-y-4 lg:space-y-6">
                  <div>
                    <label className="block text-amber-200 text-sm font-bold mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors text-sm lg:text-base"
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
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors text-sm lg:text-base"
                      required
                      minLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-3 lg:py-4 rounded-xl font-black text-base lg:text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {}
            {activeTab === 'account' && (
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 shadow-2xl rounded-2xl p-4 lg:p-8 border border-gray-700">
                <h2 className="text-xl lg:text-2xl font-black mb-4 lg:mb-6">Account Management</h2>
                <div className="space-y-4 lg:space-y-6">
                  <div className="bg-red-500/20 text-red-300 p-4 lg:p-6 rounded-xl border border-red-500/30">
                    <h3 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4">Danger Zone</h3>
                    <p className="mb-3 lg:mb-4 text-sm lg:text-base">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 text-sm lg:text-base"
                    >
                      Delete Account
                    </button>
                  </div>
                  <div className="bg-blue-500/20 text-blue-300 p-4 lg:p-6 rounded-xl border border-blue-500/30">
                    <h3 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4">Export Data</h3>
                    <p className="mb-3 lg:mb-4 text-sm lg:text-base">
                      Download a copy of your data including posts, profile information, and interactions.
                    </p>
                    <button
                      onClick={() => showMessage('Data export feature coming soon!', 'success')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 text-sm lg:text-base"
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
    </div>
  )
}