import React from "react";

export default function StatsOverview({ stats, loading }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Community Stats</h2>
      <p className="text-gray-700 text-center max-w-md">See how the Fortress community is growing and thriving!</p>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <StatCard label="Total Users" value={loading ? "-" : stats.totalUsers} />
        <StatCard label="Verified Members" value={loading ? "-" : stats.verifiedUsers} />
        <StatCard label="Fortress Access" value={loading ? "-" : stats.fortressAccess} />
        <StatCard label="Active Today" value={loading ? "-" : stats.activeToday} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white border border-yellow-300 rounded-xl p-4 shadow-sm">
      <div className="text-xl font-bold mb-1 text-black">{value}</div>
      <div className="text-sm font-medium text-gray-900/80 text-center">{label}</div>
    </div>
  );
}
