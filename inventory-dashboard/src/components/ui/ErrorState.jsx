import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50 rounded-2xl border border-red-100">
      <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-red-600 max-w-md mb-6">{message || 'We could not fetch the data. Please check your connection or try again later.'}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      )}
    </div>
  )
}

export default ErrorState
