"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ResultsChart({ question, results, isTeacher = true }) {
  // Only show to teachers
  if (!isTeacher) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="bg-gradient-to-r from-gray-100 to-blue-100 rounded-lg p-6">
          <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-blue-600 font-bold text-lg">📊</span>
          </div>
          <p className="text-gray-600">
            Live results are visible to the host only.
          </p>
        </div>
      </div>
    );
  }

  if (!results || !results.tallies) {
    return (
      <div className="text-center py-8">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
          <div className="animate-pulse w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-indigo-600 font-bold text-lg">⏳</span>
          </div>
          <p className="text-gray-600">Waiting for responses...</p>
        </div>
      </div>
    );
  }

  const data = Object.entries(results.tallies).map(([optionId, votes]) => {
    const option = question.options?.find((opt) => opt.id === optionId);
    const percentage =
      results.totalVotes > 0
        ? Math.round((votes / results.totalVotes) * 100)
        : 0;

    return {
      option: option?.text || `Option ${optionId}`,
      votes,
      percentage,
      fill: getBarColor(percentage),
    };
  });

  return (
    <div className="space-y-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis
              dataKey="option"
              tick={{ fontSize: 12, fill: "#4f46e5" }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fill: "#4f46e5" }} />
            <Tooltip
              formatter={(value, name) => [
                name === "votes" ? `${value} votes` : `${value}%`,
                name === "votes" ? "Votes" : "Percentage",
              ]}
              labelStyle={{ color: "#4f46e5" }}
              contentStyle={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar dataKey="votes" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-white to-indigo-50 rounded-lg p-4 border border-indigo-100 shadow-sm"
          >
            <div className="font-medium text-sm text-gray-900 truncate mb-2">
              {item.option}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-indigo-600">
                {item.votes}
              </span>
              <span className="text-sm text-gray-600 bg-indigo-100 px-2 py-1 rounded">
                {item.percentage}%
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-indigo-50 p-3 rounded-lg">
        <span className="font-medium text-indigo-700">
          Total Responses: {results.totalVotes}
        </span>
      </div>
    </div>
  );
}

function getBarColor(percentage) {
  if (percentage >= 50) return "#6366f1"; // Indigo
  if (percentage >= 30) return "#3b82f6"; // Blue
  if (percentage >= 15) return "#10b981"; // Green
  return "#6b7280"; // Gray
}
