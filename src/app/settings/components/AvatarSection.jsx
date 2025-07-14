import { X, Camera, Loader2 } from 'lucide-react'

export default function AvatarSection({
  avatar_url, setAvatarUrl,
  avatarFile, setAvatarFile,
  avatarPreview, setAvatarPreview,
  avatarUploading,
  setAvatarUploading,
  showMessage,
  profile
}) {
  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setAvatarUrl('')
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
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative mb-4">
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center overflow-hidden border-4 border-amber-400 shadow-lg">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
          ) : avatar_url ? (
            <img src={avatar_url} alt="Current avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-3xl">
              {profile?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>
        {(avatarPreview || avatar_url) && (
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
            {avatarPreview || avatar_url ? 'Change Avatar' : 'Upload Avatar'}
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
  )
}