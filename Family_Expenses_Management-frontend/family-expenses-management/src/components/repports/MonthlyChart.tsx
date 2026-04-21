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
  // Màu sắc đặc trưng cho biểu đồ
  const chartColors = {
    expenses: "#ef4444",  // Đỏ - Chi tiêu
    budget: "#22c55e",    // Xanh lá - Ngân sách
    savings: "#3b82f6"    // Xanh dương - Tiết kiệm
  }

  // Component Tooltip tùy chỉnh (Tiếng Việt)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-gray-900 mb-2 border-b pb-1">{label}</p>
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-3 py-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600 min-w-[80px]">{item.name}:</span>
              <span className="font-semibold text-gray-900">
                {item.value.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Hàm định dạng trục Y (Ví dụ: 1tr, 2tr...)
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${value / 1000000}tr`
    if (value >= 1000) return `${value / 1000}k`
    return value.toString()
  }

  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 10,
            bottom: 10
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f0f0f0" 
            vertical={false}
          />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={false}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{
              paddingBottom: '20px',
              fontSize: '13px'
            }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Chi tiêu"
            stroke={chartColors.expenses}
            strokeWidth={3}
            dot={{ fill: chartColors.expenses, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="budget"
            name="Ngân sách"
            stroke={chartColors.budget}
            strokeWidth={3}
            dot={{ fill: chartColors.budget, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="savings"
            name="Tiết kiệm"
            stroke={chartColors.savings}
            strokeWidth={3}
            dot={{ fill: chartColors.savings, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}