import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'from-amber-400 to-yellow-400', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          {Icon && <Icon className="w-6 h-6 text-gray-900" />}
        </div>
        {trend && (
          <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
            trend > 0 
              ? 'text-green-700 bg-green-100' 
              : trend < 0 
                ? 'text-red-700 bg-red-100'
                : 'text-gray-700 bg-gray-100'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-gray-600 font-semibold text-sm uppercase tracking-wide">
          {title}
        </h3>
        <div className="text-3xl font-black text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <p className="text-gray-500 text-sm font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}