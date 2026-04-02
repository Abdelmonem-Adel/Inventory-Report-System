import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CategoryStackedBar = ({ data, visibleStatuses = ['Match', 'Gain', 'Loss'] }) => {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#718096', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#718096', fontSize: 11 }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            formatter={(value, name, props) => {
              if (name === 'Match') return [value, 'Matched Items']
              if (name === 'Gain') return [value, 'Gain Items']
              if (name === 'Loss') return [value, 'Loss Items']
              return [value, name]
            }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }}
          />
          {visibleStatuses.includes('Match') && (
            <Bar dataKey="Match" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} barSize={40} />
          )}
          {visibleStatuses.includes('Gain') && (
            <Bar dataKey="Gain" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={40} />
          )}
          {visibleStatuses.includes('Loss') && (
            <Bar dataKey="Loss" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CategoryStackedBar
