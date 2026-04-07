import React from 'react'
import { X } from 'lucide-react'

const ProductTrendTable = ({ data, productName, sku, onClose }) => {
  if (!data || data.length === 0) return null

  const sortedData = [...data].sort((a, b) => new Date(b.dateInput || b.date) - new Date(a.dateInput || a.date))

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-gray-900 leading-tight">
            {productName}
          </h3>
          <div className="text-xs font-bold text-gray-400 flex items-center gap-2">
            <span>SKU: {sku}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>Total Records: {sortedData.length}</span>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100">
              <th className="px-4 py-3 text-[10px] uppercase font-black text-gray-400 tracking-widest w-1/3">Date</th>
              <th className="px-4 py-3 text-[10px] uppercase font-black text-gray-400 tracking-widest text-center">FinalQty</th>
              <th className="px-4 py-3 text-[10px] uppercase font-black text-gray-400 tracking-widest text-center">Sys Qty</th>
              <th className="px-4 py-3 text-[10px] uppercase font-black text-gray-400 tracking-widest text-right">Discrepancy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedData.map((record, i) => {
              const finalQty = Number(record.finalQuantity) || 0
              const sysQty = Number(record.sysQuantity) || 0
              const variance = finalQty - sysQty
              const isPositive = variance >= 0

              return (
                <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-gray-400">
                    {new Date(record.dateInput || record.date).toISOString().split('T')[0]}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-900 text-center">
                    {finalQty}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-400 text-center">
                    {sysQty}
                  </td>
                  <td className={`px-4 py-4 text-sm font-bold text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? `+${variance}` : variance}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer (Optional if needed by modal) */}
      {onClose && (
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductTrendTable
