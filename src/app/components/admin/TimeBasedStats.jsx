import { motion } from 'framer-motion';

export default function TimeBasedStats({ title, data, icon: Icon, color = 'from-amber-400 to-yellow-400' }) {
  const timeLabels = {
    today: 'Today',
    week: 'This Week',
    twoWeeks: '2 Weeks',
    month: '30 Days'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          {Icon && <Icon className="w-6 h-6 text-gray-900" />}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(data).map(([key, value], index) => {
          if (key === 'total') return null;
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 bg-gray-50/50 rounded-xl border border-gray-100"
            >
              <div className="text-2xl font-black text-gray-900 mb-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              <div className="text-sm text-gray-600 font-semibold">
                {timeLabels[key] || key}
              </div>
            </motion.div>
          );
        })}
      </div>

      {data.total !== undefined && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-sm text-gray-600 font-semibold mb-1">Total All Time</div>
            <div className="text-3xl font-black text-gray-900">
              {data.total.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}