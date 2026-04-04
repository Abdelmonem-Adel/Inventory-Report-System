import React, { useState } from 'react'
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts'

const StaffProductivityChart = ({ data }) => {
  const [activeMetrics, setActiveMetrics] = useState({
    totalItems: true,
    match: true,
    humanError: true
  })

  const toggleMetric = (metric) => {
    setActiveMetrics(prev => ({ ...prev, [metric]: !prev[metric] }))
  }

  return (
    <div className="space-y-6">
      {/* Metric Toggles */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {[
          { id: 'totalItems', label: 'Total Items', color: 'blue' },
          { id: 'match', label: 'Match', color: 'green' },
          { id: 'humanError', label: 'Human Error', color: 'red' }
        ].map(metric => (
          <button
            key={metric.id}
            onClick={() => toggleMetric(metric.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-2.5 ${
              activeMetrics[metric.id]
                ? metric.color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-700'
                : metric.color === 'green' ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-gray-100 text-gray-400 opacity-60 hover:opacity-100'
            }`}
          >
            <div className={`w-3 h-3 rounded-full shadow-sm ${
              activeMetrics[metric.id]
                ? metric.color === 'blue' ? 'bg-blue-500'
                : metric.color === 'green' ? 'bg-green-500'
                : 'bg-red-500'
                : 'bg-gray-200'
            }`} />
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[550px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 80, left: 150, bottom: 150 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="userName" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 600 }}
            />
            {/* <Legend verticalAlign="top" align="right" height={36} iconType="circle" /> */}
            
            {activeMetrics.totalItems && (
              <Bar
                dataKey="totalItems"
                name="Total Items"
                fill="#3B82F6"
                barSize={16}
              />
            )}
            {activeMetrics.match && (
              <Bar
                dataKey="match"
                name="Match"
                fill="#10B981"
                barSize={16}
              />
            )}
            {activeMetrics.humanError && (
              <Bar
                dataKey="humanError"
                name="Human Error"
                fill="#EF4444"
                barSize={16}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default StaffProductivityChart
