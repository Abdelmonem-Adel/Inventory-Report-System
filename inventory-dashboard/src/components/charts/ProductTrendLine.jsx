import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatDate } from '../../utils/dateUtils'

const ProductTrendLine = ({ data, productName }) => {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => {
    const da = new Date(a.dateInput || a.date)
    const db = new Date(b.dateInput || b.date)
    return da - db
  })
    .map(d => ({
      ...d,
      formattedDate: formatDate(d.dateInput || d.date),
      finalQty: Number(d.finalQuantity),
      sysQty: Number(d.sysQuantity)
    }))

  return (
    <div className="w-full">
      <div className="h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={sortedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="formattedDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#718096', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#718096', fontSize: 11 }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }}
            />
            <Line 
              type="monotone" 
              dataKey="finalQty" 
              name="Final QTY"
              stroke="#22c55e" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="sysQty" 
              name="System Qty"
              stroke="#94a3b8" 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#94a3b8', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ProductTrendLine
