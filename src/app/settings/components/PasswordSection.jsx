import { useState } from 'react'

export default function PasswordSection({ passwordData, setPasswordData, updating, setUpdating, showMessage, supabase }) {
  const [localUpdating, setLocalUpdating] = useState(false)
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setLocalUpdating(true)
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('New passwords do not match', 'error')
      setUpdating(false)
      setLocalUpdating(false)
      return
    }
    if (passwordData.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error')
      setUpdating(false)
      setLocalUpdating(false)
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
      setLocalUpdating(false)
    }
  }

  return (
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
          disabled={updating || localUpdating}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-4 rounded-xl font-black text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {(updating || localUpdating) ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}