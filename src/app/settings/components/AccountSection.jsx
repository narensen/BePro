export default function AccountSection({ user, supabase, showMessage, router }) {
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
        showMessage('Error deleting account', 'error')
      }
    }
  }
  return (
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
  )
}