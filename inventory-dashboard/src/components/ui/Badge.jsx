import React from 'react'

const Badge = ({ children, variant = 'match', className = '' }) => {
  const variants = {
    match: 'bg-green-100 text-green-700',
    extra: 'bg-orange-100 text-orange-700',
    gain: 'bg-orange-100 text-orange-700',
    missing: 'bg-red-100 text-red-700',
    loss: 'bg-red-100 text-red-700',
    error: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  }

  const bgColor = variants[variant.toLowerCase()] || variants.match

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${bgColor} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
