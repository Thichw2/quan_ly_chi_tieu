'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CategoryPieChartProps {
  data: Array<{ name: string; value: number }>
}

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C']

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  return (
    <ChartContainer
      config={data.reduce<ChartConfig>((acc, item, index) => {
        acc[item.name] = {
          label: item.name,
          color: COLORS[index % COLORS.length],
        };
        return acc;
      }, {})}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

