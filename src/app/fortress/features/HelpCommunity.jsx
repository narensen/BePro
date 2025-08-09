import React from "react";

export default function HelpCommunity() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Help the Community</h2>
      <p className="text-gray-700 text-center max-w-md">Mentor others, answer questions, and contribute to the growth of the Fortress community. Every bit of help counts!</p>
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        <div className="bg-white border border-yellow-300 rounded-xl p-4 w-64 flex flex-col items-center shadow">
          <span className="font-bold text-lg text-gray-900 mb-2">Answer Questions</span>
          <span className="text-gray-700 text-sm mb-3">Help others by sharing your knowledge.</span>
          <button className="bg-yellow-400 text-black px-4 py-1 rounded-full font-bold hover:bg-yellow-500 transition-all">Start Helping</button>
        </div>
        <div className="bg-white border border-yellow-300 rounded-xl p-4 w-64 flex flex-col items-center shadow">
          <span className="font-bold text-lg text-gray-900 mb-2">Become a Mentor</span>
          <span className="text-gray-700 text-sm mb-3">Guide new members and make a difference.</span>
          <button className="bg-yellow-400 text-black px-4 py-1 rounded-full font-bold hover:bg-yellow-500 transition-all">Become Mentor</button>
        </div>
      </div>
    </div>
  );
}
