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
      <div className="flex flex-wrap gap-4 px-4 py-2 bg-gray-50/50 rounded-xl border border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={activeMetrics.totalItems} 
            onChange={() => toggleMetric('totalItems')}
            className="w-4 h-4 rounded text-blue-500 border-gray-300 focus:ring-blue-500/20"
          />
          <span className={`text-xs font-bold transition-colors ${activeMetrics.totalItems ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
            Total Items
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={activeMetrics.match} 
            onChange={() => toggleMetric('match')}
            className="w-4 h-4 rounded text-green-500 border-gray-300 focus:ring-green-500/20"
          />
          <span className={`text-xs font-bold transition-colors ${activeMetrics.match ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
            Match
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={activeMetrics.humanError} 
            onChange={() => toggleMetric('humanError')}
            className="w-4 h-4 rounded text-red-500 border-gray-300 focus:ring-red-500/20"
          />
          <span className={`text-xs font-bold transition-colors ${activeMetrics.humanError ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
            Human Error
          </span>
        </label>
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
            <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
            
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
