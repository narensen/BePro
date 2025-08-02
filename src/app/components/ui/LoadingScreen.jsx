import { SparkleIcon } from '@/app/components/icons/SparkleIcon';

export const LoadingScreen = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 flex items-center justify-center font-mono">
    <div className="relative text-center">
      <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <SparkleIcon className="w-6 h-6 relative bottom-4 text-white animate-pulse" />
      </div>
      <p className="text-white font-bold mt-4">Initializing The Forge...</p>
    </div>
  </div>
);