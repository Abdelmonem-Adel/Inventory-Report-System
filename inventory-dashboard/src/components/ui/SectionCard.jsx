import React from 'react'

const SectionCard = ({ title, subtitle, icon, children, color = 'blue', headerActions, fullHeight = false }) => {
  const borderColors = {
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    orange: 'border-orange-500',
    red: 'border-red-500',
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ${fullHeight ? 'h-full' : ''}`}>
      <div className={`border-l-4 ${borderColors[color] || borderColors.blue} p-4 flex items-center justify-between border-b border-gray-50`}>
        <div className="flex items-center gap-3">
          {icon && <div className="text-gray-400">{icon}</div>}
          <div>
            <h3 className="text-18px font-bold text-gray-900 leading-tight flex items-center gap-2">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {headerActions && <div>{headerActions}</div>}
      </div>
      <div className={`p-4 ${fullHeight ? 'flex-1' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default SectionCard
