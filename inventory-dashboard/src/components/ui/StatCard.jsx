import React from 'react'

const StatCard = ({ label, value, color = 'blue', percentage, progress }) => {
  const borderColors = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    orange: 'border-orange-500',
    red: 'border-red-500',
    purple: 'border-purple-500',
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${borderColors[color] || borderColors.blue} p-4 flex flex-col justify-between h-full`}>
      <div className="text-10px uppercase tracking-wider text-muted font-semibold mb-1">
        {label}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-32px font-extrabold text-gray-900 leading-none">
          {value}
        </div>
        {percentage !== undefined && (
          <div className="text-sm font-bold text-gray-400">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
      {progress !== undefined && (
        <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
          <div 
            className="bg-blue-500 h-1.5 rounded-full" 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}

export default StatCard
