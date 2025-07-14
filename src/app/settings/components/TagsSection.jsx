import { useState } from 'react'
import { Tag, Search } from 'lucide-react'

export default function TagsSection({ selectedTags, setSelectedTags, availableTags }) {
  const [searchQuery, setSearchQuery] = useState('')
  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.category.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const groupedTags = filteredTags.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = []
    acc[tag.category].push(tag)
    return acc
  }, {})

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId))
    } else if (selectedTags.length < 6) {
      setSelectedTags([...selectedTags, tagId])
    }
  }
  return (
    <div className="mb-6">
      <label className="block text-amber-200 text-sm font-bold mb-2 flex items-center gap-2">
        <Tag size={16} /> Interests & Tags
      </label>
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
  )
}