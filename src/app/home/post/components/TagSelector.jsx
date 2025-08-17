'use client'

import { Hash, X, ChevronDown, ChevronUp } from 'lucide-react'

const availableTags = [
  { id: 'AI', name: 'Artificial Intelligence', category: 'Technology' },
  { id: 'ML', name: 'Machine Learning', category: 'Technology' },
  { id: 'DS', name: 'Data Science', category: 'Technology' },
  { id: 'WEB_DEV', name: 'Web Development', category: 'Technology' },
  { id: 'MOBILE_DEV', name: 'Mobile Development', category: 'Technology' },
  { id: 'CLOUD', name: 'Cloud Computing', category: 'Technology' },
  { id: 'CYBER', name: 'Cybersecurity', category: 'Technology' },
  { id: 'UI_UX', name: 'UI/UX Design', category: 'Technology' },
  { id: 'SOFTWARE_ENG', name: 'Software Engineering', category: 'Technology' },
  { id: 'MECH_ENG', name: 'Mechanical Engineering', category: 'Engineering' },
  { id: 'ELEC_ENG', name: 'Electrical Engineering', category: 'Engineering' },
  { id: 'CIVIL_ENG', name: 'Civil Engineering', category: 'Engineering' },
  { id: 'INDUSTRIAL_ENG', name: 'Industrial Engineering', category: 'Engineering' },
  { id: 'AERO_ENG', name: 'Aerospace Engineering', category: 'Engineering' },
  { id: 'BIOTECHNOLOGY', name: 'Biotechnology', category: 'Life Sciences' },
  { id: 'GENETICS', name: 'Genetics', category: 'Life Sciences' },
  { id: 'MEDICINE', name: 'Medicine', category: 'Life Sciences' },
  { id: 'BIOINFORMATICS', name: 'Bioinformatics', category: 'Life Sciences' },
  { id: 'NEUROSCIENCE', name: 'Neuroscience', category: 'Life Sciences' },
  { id: 'PUBLIC_HEALTH', name: 'Public Health', category: 'Life Sciences' },
  { id: 'HEALTHCARE_IT', name: 'Healthcare IT', category: 'Life Sciences' },
  { id: 'FINANCE', name: 'Finance', category: 'Business' },
  { id: 'BUSINESS_ANALYTICS', name: 'Business Analytics', category: 'Business' },
  { id: 'MANAGEMENT', name: 'Management', category: 'Business' },
  { id: 'MARKETING', name: 'Marketing', category: 'Business' },
  { id: 'OPERATIONS', name: 'Operations Management', category: 'Business' },
  { id: 'STATISTICS', name: 'Statistics', category: 'Mathematics' },
  { id: 'SUSTAINABILITY', name: 'Sustainability', category: 'Energy' },
  { id: 'RENEWABLE_ENERGY', name: 'Renewable Energy', category: 'Energy' },
  { id: 'CLIMATE_SCIENCE', name: 'Climate Science', category: 'Energy' },
  { id: 'SPACE_TECH', name: 'Space Technology', category: 'Emerging Tech' },
  { id: 'AUTONOMOUS_VEHICLES', name: 'Autonomous Vehicles', category: 'Emerging Tech' },
  { id: 'SMART_CITIES', name: 'Smart Cities', category: 'Emerging Tech' },
  { id: 'PRODUCT_DEV', name: 'Product Development', category: 'Research' },
  { id: 'INNOVATION', name: 'Innovation Management', category: 'Research' },
  { id: 'BLOCKCHAIN', name: 'Blockchain Technology', category: 'Technology' }
];

const groupedTags = availableTags.reduce((acc, tag) => {
  if (!acc[tag.category]) acc[tag.category] = []
  acc[tag.category].push(tag)
  return acc
}, {})

export default function TagSelector({ tags, removeTag, expandedCategories, toggleCategory, toggleTag }) {
  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex items-center gap-2 mb-3 lg:mb-4">
        <Hash className="w-4 h-4 lg:w-5 lg:h-5 text-gray-800" />
        <span className="text-gray-900 font-bold text-base lg:text-lg">Tags</span>
        <span className="text-gray-600 text-sm font-semibold">({tags.length}/6)</span>
      </div>

      {}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <div key={tag} className="flex items-center gap-1 px-3 lg:px-4 py-2 bg-black text-gray-300 rounded-full text-xs lg:text-sm font-bold shadow-lg">
              <span>{tag}</span>
              <button onClick={() => removeTag(tag)} className="ml-1 hover:bg-white/20 rounded-full p-1 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {}
      <div className="space-y-3 lg:space-y-4">
        {Object.entries(groupedTags).map(([category, tagsInCategory]) => (
          <div key={category}>
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex justify-between items-center px-3 lg:px-4 py-2 lg:py-3 bg-black text-gray-300 rounded-xl font-bold text-left shadow-md text-sm lg:text-base"
            >
              <span>{category}</span>
              {expandedCategories.includes(category) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedCategories.includes(category) && (
              <div className="mt-2 lg:mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
                {tagsInCategory.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.name)}
                    className={`px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                      tags.includes(tag.name)
                        ? 'bg-gray-900 text-gray-300 shadow-lg'
                        : tags.length >= 6
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-gray-800 border-2 border-gray-300 hover:border-gray-900 shadow-sm'
                    }`}
                    disabled={!tags.includes(tag.name) && tags.length >= 6}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}