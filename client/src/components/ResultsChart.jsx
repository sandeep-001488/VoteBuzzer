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

export default function ResultsChart({ question, results }) {
  if (!results || !results.tallies) {
    return (
      <div className="text-center py-8 text-gray-500">
        Waiting for responses...
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="option"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                name === "votes" ? `${value} votes` : `${value}%`,
                name === "votes" ? "Votes" : "Percentage",
              ]}
            />
            <Bar dataKey="votes" fill="#7C3AED" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3">
            <div className="font-medium text-sm text-gray-900 truncate">
              {item.option}
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-2xl font-bold text-purple-600">
                {item.votes}
              </span>
              <span className="text-sm text-gray-600">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600">
        Total Responses: {results.totalVotes}
      </div>
    </div>
  );
}

function getBarColor(percentage) {
  if (percentage >= 50) return "#7C3AED"; // Purple
  if (percentage >= 30) return "#3B82F6"; // Blue
  if (percentage >= 15) return "#10B981"; // Green
  return "#6B7280"; // Gray
}
