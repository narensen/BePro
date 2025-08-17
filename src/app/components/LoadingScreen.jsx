import { Sparkles, Atom, Zap } from 'lucide-react'

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="text-center max-w-2xl">
        {}
        <div className="relative mb-12">
          {}
          <div className="w-32 h-32 mx-auto relative">
            <div className="absolute inset-0 border-4 border-transparent border-t-gray-400 border-r-gray-600 border-b-gray-800 border-l-gray-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-t-gray-200 border-r-gray-300 border-b-gray-400 border-l-gray-100 rounded-full animate-spin animation-delay-500" style={{animationDirection: 'reverse'}}></div>
            <div className="absolute inset-4 border-4 border-transparent border-t-gray-100 border-r-gray-200 border-b-gray-300 border-l-gray-200 rounded-full animate-spin"></div>
            
            {}
            <div className="absolute inset-0 flex items-center justify-center">
              <Atom className="w-14 h-14 text-gray-400 drop-shadow-lg animate-pulse" />
            </div>
          </div>
        </div>

        {}
        <div className="mb-8">
          <h2 className="text-4xl font-black text-gray-700 mb-4 animate-pulse">
            Codex is thinking...
          </h2>
          <p className="text-gray-800 text-xl font-medium mb-6">
            Crafting your personalized learning roadmap
          </p>
        </div>

        {}
        <div className="space-y-4 mb-8">
          {[
            { icon: Sparkles, text: "Analyzing your learning goal", delay: "0s" },
            { icon: Atom, text: "Processing optimal learning path", delay: "1s" },
            { icon: Zap, text: "Generating personalized content", delay: "2s" }
          ].map((step, index) => (
            <div 
              key={index}
              className="flex items-center justify-center space-x-3 text-gray-800 font-medium animate-fadeIn"
              style={{ animationDelay: step.delay }}
            >
              <step.icon className="w-5 h-5 text-gray-400 animate-pulse" />
              <span>{step.text}</span>
            </div>
          ))}
        </div>

        {}
        <div className="flex justify-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"
              style={{ 
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.4s'
              }}
            ></div>
          ))}
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen