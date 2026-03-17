'use client'

import React from 'react'
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface MonthlyChartProps {
  data: Array<{
    month: string
    expenses: number
    budget: number
    savings: number
  }>
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
  // Custom styles for better visibility
  const chartColors = {
    expenses: "#ef4444",  // red-500
    budget: "#22c55e",    // green-500
    savings: "#3b82f6"    // blue-500
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600">{item.name}:</span>
              <span className="font-medium">
                ${item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[400px] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
          />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke={chartColors.expenses}
            strokeWidth={2}
            dot={{ fill: chartColors.expenses }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="budget"
            stroke={chartColors.budget}
            strokeWidth={2}
            dot={{ fill: chartColors.budget }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="savings"
            stroke={chartColors.savings}
            strokeWidth={2}
            dot={{ fill: chartColors.savings }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

