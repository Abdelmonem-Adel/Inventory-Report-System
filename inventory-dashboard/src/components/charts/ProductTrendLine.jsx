import React from 'react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { formatDate } from '../../utils/dateUtils'

const ProductTrendLine = ({ data, productName }) => {
  // Sort data by date and calculate variance
  const sortedData = [...data].sort((a, b) => {
    const da = new Date(a.dateInput || a.date)
    const db = new Date(b.dateInput || b.date)
    return da - db
  })
    .map(d => {
      const finalQty = Number(d.finalQuantity) || 0
      const sysQty = Number(d.sysQuantity) || 0
      const variance = finalQty - sysQty
      
      return {
        ...d,
        formattedDate: formatDate(d.dateInput || d.date),
        variance,
        absVariance: Math.abs(variance)
      }
    })

  return (
    <div className="w-full">
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="formattedDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              dx={-10}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value
                  const isPositive = val > 0
                  const isNegative = val < 0
                  return (
                    <div className="bg-white p-4 shadow-xl rounded-2xl border border-gray-50 animate-in zoom-in-95 duration-200">
                      <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{label}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-blue-600'}`}>
                          {isPositive ? `+${val}` : val}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Discrepancy</span>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="variance" 
              name="Discrepancy"
              stroke="#3b82f6" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorVar)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                const val = payload.variance;
                const fill = val > 0 ? '#22c55e' : val < 0 ? '#ef4444' : '#3b82f6';
                return (
                  <circle 
                    key={`dot-${payload.formattedDate}`}
                    cx={cx} 
                    cy={cy} 
                    r={5} 
                    fill={fill} 
                    stroke="#fff" 
                    strokeWidth={2} 
                    className="drop-shadow-sm transition-all hover:r-7"
                  />
                );
              }}
              activeDot={{ r: 7, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gain</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Match</span>
        </div>
      </div>
    </div>
  )
}

export default ProductTrendLine
