import React from 'react'

const Spinner = ({ size = 'md', color = 'accent' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  }

  const colors = {
    accent: 'border-blue-200 border-t-blue-500',
    success: 'border-green-200 border-t-green-500',
    white: 'border-white/30 border-t-white',
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`rounded-full animate-spin ${sizes[size]} ${colors[color]}`}></div>
    </div>
  )
}

export default Spinner
