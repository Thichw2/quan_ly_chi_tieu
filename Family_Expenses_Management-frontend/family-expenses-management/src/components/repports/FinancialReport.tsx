'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MonthlyChart } from './MonthlyChart'
import { CategoryPieChart } from './CategoryPieChart'
import { MemberBarChart } from './MemberBarChart'
import { RecentExpensesTable } from './RecentExpensesTable'
import { exportToExcel } from './ExcelExport'
import {
  Wallet,
  CreditCard,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  PercentCircle
} from 'lucide-react'
import { Progress } from "@/components/ui/progress"

// --- Interfaces ---
interface CategoryData {
  name: string
  value: number
}

interface MemberData {
  totalBudget: number
  totalSpent: number
  categoryData: CategoryData[]
}

interface MembersData {
  members: {
    [key: string]: MemberData
  }
}

interface OverviewData {
  totalBudget: number
  totalSpent: number
  categoryData: Array<{ name: string; value: number }>
  memberData: Array<{ name: string; amount: number }>
  recentExpenses: Array<{
    id: string
    name: string
    amount: number
    category: string
    member: string
  }>
}

interface MonthlyData {
  monthlyData: Array<{
    month: string
    expenses: number
    budget: number
    savings: number
  }>
}

// --- Helper: Định dạng tiền tệ VNĐ ---
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

// --- Component: Chi tiết thành viên ---
const MemberCard: React.FC<{ membersData: MembersData }> = ({ membersData }) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800">Chi tiết thành viên</CardTitle>
            <CardDescription>Phân tích chi tiêu theo từng người</CardDescription>
          </div>
          <Wallet className="w-8 h-8 text-blue-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(membersData.members).map(([member, data]) => (
            <div key={member} className="p-4 rounded-lg bg-gray-50 border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{member}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Đã dùng</span>
                  <span className="font-medium">
                    {((data.totalSpent / data.totalBudget) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <Progress 
                value={(data.totalSpent / data.totalBudget) * 100}
                className="h-2 mb-4"
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ngân sách</p>
                    <p className="font-semibold text-sm">{formatCurrency(data.totalBudget)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500">Đã chi</p>
                    <p className="font-semibold text-sm">{formatCurrency(data.totalSpent)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600 border-t pt-2">Theo danh mục</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-white border border-gray-100">
                      <span className="text-xs text-gray-600">{category.name}</span>
                      <span className="text-xs font-medium">{formatCurrency(category.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// --- Component: Tổng hợp chung ---
const SummaryCard: React.FC<{ overviewData: OverviewData }> = ({ overviewData }) => {
  const spendPercentage = overviewData.totalBudget > 0
    ? ((overviewData.totalSpent / overviewData.totalBudget) * 100)
    : 0

  const getStatusColor = (percentage: number): string => {
    if (percentage < 50) return 'text-green-500'
    if (percentage < 75) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800">Tổng hợp chung</CardTitle>
            <CardDescription>Tình hình tài chính tổng thể</CardDescription>
          </div>
          <PiggyBank className="w-8 h-8 text-green-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span>Tiến độ chi tiêu</span>
            <span>{spendPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={spendPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <p className="text-blue-700 text-sm font-medium">Tổng ngân sách</p>
            </div>
            <p className="text-xl font-bold text-gray-800">
              {formatCurrency(overviewData.totalBudget)}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-red-50 border border-red-100">
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 text-sm font-medium">Tổng đã chi</p>
            </div>
            <p className="text-xl font-bold text-gray-800">
              {formatCurrency(overviewData.totalSpent)}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-green-50 border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <PiggyBank className="w-5 h-5 text-green-500" />
              <p className="text-green-700 text-sm font-medium">Còn lại</p>
            </div>
            <p className="text-xl font-bold text-gray-800">
              {formatCurrency(overviewData.totalBudget - overviewData.totalSpent)}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
            <div className="flex items-center gap-3 mb-2">
              <PercentCircle className="w-5 h-5 text-purple-500" />
              <p className="text-purple-700 text-sm font-medium">Tỷ lệ sử dụng</p>
            </div>
            <p className={`text-xl font-bold ${getStatusColor(spendPercentage)}`}>
              {spendPercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main Page Component ---
export default function FinancialReport({
  overviewData,
  membersData,
  monthlyData
}: FinancialReportProps) {
  
  if (!overviewData || !membersData || !monthlyData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-500">Đang tải dữ liệu báo cáo...</p>
      </div>
    );
  }

  const handleExport = () => {
    exportToExcel(overviewData, membersData, monthlyData)
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Báo cáo tài chính</h1>
          <p className="text-muted-foreground">Theo dõi và phân tích thu chi gia đình</p>
        </div>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
          Xuất file Excel
        </Button>
      </div>

      {/* Biểu đồ tổng quan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Tổng quan hàng tháng</CardTitle>
            <CardDescription>So sánh Chi tiêu, Ngân sách và Tiết kiệm</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={monthlyData.monthlyData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Cơ cấu chi tiêu</CardTitle>
            <CardDescription>Phân bổ chi tiêu theo danh mục</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={overviewData?.categoryData || []} />
          </CardContent>
        </Card>
      </div>

      {/* Chi tiêu thành viên & Bảng kê */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Chi tiêu theo thành viên</CardTitle>
            <CardDescription>Tổng số tiền mỗi người đã chi</CardDescription>
          </CardHeader>
          <CardContent>
            <MemberBarChart data={overviewData?.memberData || []} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>Danh sách các khoản chi tiêu mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentExpensesTable expenses={overviewData?.recentExpenses || []} />
          </CardContent>
        </Card>
      </div>

      {/* Thẻ chi tiết và Tổng kết */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
        <MemberCard membersData={membersData} />
        <SummaryCard overviewData={overviewData} />
      </div>
    </div>
  )
}