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
  // Định nghĩa màu Gradient cho các cột
  const gradientColors = {
    start: '#3b82f6', // blue-500
    end: '#60a5fa'    // blue-400
  }

  // Component Tooltip tùy chỉnh (Tiếng Việt)
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
            <span className="text-gray-600">Số tiền:</span>
            <span className="font-medium text-blue-600">
              {payload[0].value.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  // Định dạng số lớn cho trục Y (VNĐ)
  const formatYAxis = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} tr`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`
    }
    return value.toString()
  }

  // Tính toán giá trị cao nhất để tạo khoảng trống cho trục Y
  const maxValue = Math.max(...data.map(item => item.amount), 0)
  const yAxisMax = Math.ceil(maxValue * 1.1) // Thêm 10% khoảng trống phía trên

  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10
          }}
          barSize={45}
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
            formatter={() => <span className="text-gray-600 text-sm font-medium">Tổng chi tiêu</span>}
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
          <Bar 
            dataKey="amount"
            name="Số tiền"
            radius={[6, 6, 0, 0]}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`}
                fill="url(#barGradient)"
                className="hover:opacity-80 transition-opacity duration-300"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}