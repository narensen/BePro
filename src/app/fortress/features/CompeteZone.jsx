import React from "react";

export default function CompeteZone() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Competition Zone</h2>
      <p className="text-gray-700 text-center max-w-md">Join live competitions, climb the leaderboard, and win exclusive rewards. Compete with the best in the Fortress!</p>
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        <div className="bg-white border border-yellow-300 rounded-xl p-4 w-64 flex flex-col items-center shadow">
          <span className="font-bold text-lg text-gray-900 mb-2">Leaderboard</span>
          <span className="text-gray-700 text-sm mb-3">See who’s leading this week.</span>
          <button className="bg-black text-yellow-400 px-4 py-1 rounded-full font-bold hover:bg-gray-900 transition-all">View Leaderboard</button>
        </div>
        <div className="bg-white border border-yellow-300 rounded-xl p-4 w-64 flex flex-col items-center shadow">
          <span className="font-bold text-lg text-gray-900 mb-2">Upcoming Events</span>
          <span className="text-gray-700 text-sm mb-3">Register for the next big challenge.</span>
          <button className="bg-black text-yellow-400 px-4 py-1 rounded-full font-bold hover:bg-gray-900 transition-all">See Events</button>
        </div>
      </div>
    </div>
  );
}
