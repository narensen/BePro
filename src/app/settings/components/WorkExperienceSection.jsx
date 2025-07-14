import { useState } from 'react'

export default function WorkExperienceSection({ workExperience, setWorkExperience }) {
  const handleChange = (idx, field, value) => {
    setWorkExperience(workExperience.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    ))
  }

  const handleAdd = () => {
    setWorkExperience([
      ...workExperience,
      { company: '', role: '', startYear: '', endYear: '', currentlyWorking: false }
    ])
  }

  const handleRemove = (idx) => {
    setWorkExperience(workExperience.filter((_, i) => i !== idx))
  }

  return (
    <section className="mb-6">
      <label className="block text-amber-200 text-sm font-bold mb-2">Work Experience</label>
      {workExperience.map((item, idx) => (
        <div key={idx} className="mb-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Company"
              value={item.company}
              onChange={e => handleChange(idx, 'company', e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-xl text-white"
            />
            <input
              type="text"
              placeholder="Role"
              value={item.role}
              onChange={e => handleChange(idx, 'role', e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-xl text-white"
            />
            <input
              type="number"
              placeholder="Start Year"
              value={item.startYear}
              min="1900"
              max="2099"
              onChange={e => handleChange(idx, 'startYear', e.target.value)}
              className="w-32 px-4 py-2 bg-gray-900 border border-gray-600 rounded-xl text-white"
            />
            {!item.currentlyWorking && (
              <input
                type="number"
                placeholder="End Year"
                value={item.endYear}
                min={item.startYear || "1900"}
                max="2099"
                onChange={e => handleChange(idx, 'endYear', e.target.value)}
                className="w-32 px-4 py-2 bg-gray-900 border border-gray-600 rounded-xl text-white"
              />
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.currentlyWorking}
                onChange={e => handleChange(idx, 'currentlyWorking', e.target.checked)}
              />
              Currently Working
            </label>
            <button type="button" className="text-red-500 font-bold ml-2" onClick={() => handleRemove(idx)}>
              ✕
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="bg-amber-500 text-gray-900 px-4 py-2 rounded-xl mt-2 font-bold" onClick={handleAdd}>
        Add Experience
      </button>
    </section>
  )
}