'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface MemberBarChartProps {
  data: Array<{ name: string; amount: number }>
}

export const MemberBarChart: React.FC<MemberBarChartProps> = ({ data }) => {
  // Gradient definition for bars
  const gradientColors = {
    start: '#3b82f6', // blue-500
    end: '#60a5fa'    // blue-400
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: gradientColors.start }}
            />
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">
              ${payload[0].value.toLocaleString()}
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  // Format large numbers for Y axis
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  // Calculate maximum value for better Y axis range
  const maxValue = Math.max(...data.map(item => item.amount))
  const yAxisMax = Math.ceil(maxValue * 1.1) // Add 10% padding

  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-xl shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 40,
            bottom: 10
          }}
          barSize={40}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientColors.start} stopOpacity={1} />
              <stop offset="100%" stopColor={gradientColors.end} stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis 
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={false}
            tickFormatter={formatYAxis}
            domain={[0, yAxisMax]}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: '#f3f4f6' }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
          <Bar 
            dataKey="amount"
            name="Amount"
            radius={[4, 4, 0, 0]}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`}
                fill="url(#barGradient)"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
