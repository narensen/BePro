import React from "react";

export default function TrainArena() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Training Arena</h2>
      <p className="text-gray-700 text-center max-w-md">Sharpen your skills with daily challenges, quizzes, and learning missions. Track your progress and earn badges as you train!</p>
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 w-64 flex flex-col items-center shadow">
          <span className="font-bold text-lg text-gray-900 mb-2">Daily Quiz</span>
          <span className="text-gray-700 text-sm mb-3">Test your knowledge with a new quiz every day.</span>
          <button className="bg-yellow-400 text-black px-4 py-1 rounded-full font-bold hover:bg-yellow-500 transition-all">Start Quiz</button>
        </div>
        <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 w-64 flex flex-col items-center shadow">
          <span className="font-bold text-lg text-gray-900 mb-2">Skill Missions</span>
          <span className="text-gray-700 text-sm mb-3">Complete missions to level up your skills and unlock rewards.</span>
          <button className="bg-yellow-400 text-black px-4 py-1 rounded-full font-bold hover:bg-yellow-500 transition-all">View Missions</button>
        </div>
      </div>
    </div>
  );
}
