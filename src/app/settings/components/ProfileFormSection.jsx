export default function ProfileFormSection({ formData, setFormData }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  return (
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
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white"
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
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white"
        />
      </div>
      <div>
        <label className="block text-amber-200 text-sm font-bold mb-2">
          GitHub URL
        </label>
        <input
          type="url"
          name="github_url"
          value={formData.github_url}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white"
          placeholder="https://github.com/yourprofile"
        />
      </div>
      <div>
        <label className="block text-amber-200 text-sm font-bold mb-2">
          X (Twitter) URL
        </label>
        <input
          type="url"
          name="x_url"
          value={formData.x_url}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white"
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
          value={formData.location}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white"
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
          value={formData.university}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white"
          placeholder="Your University"
        />
      </div>
    </div>
  )
}