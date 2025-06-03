export default function TimelineItem({ phase, description, status }) {
  const getStatusStyles = () => {
    switch(status) {
      case 'active':
        return 'bg-gradient-to-r from-emerald-400 to-emerald-500 border-emerald-600 shadow-emerald-200'
      case 'upcoming':
        return 'bg-gradient-to-r from-blue-400 to-blue-500 border-blue-600 shadow-blue-200'
      case 'future':
        return 'bg-gradient-to-r from-purple-400 to-purple-500 border-purple-600 shadow-purple-200'
      default:
        return 'bg-gradient-to-r from-yellow-400 to-amber-400 border-amber-600'
    }
  }

  return (
    <div className={`${getStatusStyles()} rounded-2xl p-8 border-2 shadow-xl transform hover:scale-105 transition-all duration-300`}>
      <h3 className="font-black text-2xl mb-4 text-gray-900">{phase}</h3>
      <p className="text-gray-800 text-lg leading-relaxed">{description}</p>
    </div>
  )
}