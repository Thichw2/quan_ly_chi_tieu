'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MonthlyChart } from './MonthlyChart'
import { CategoryPieChart } from './CategoryPieChart'
import { MemberBarChart } from './MemberBarChart'
import { RecentExpensesTable } from './RecentExpensesTable'
import { exportToExcel } from './ExcelExport'
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

interface MemberData {
  totalBudget: number;
  totalSpent: number;
  categoryData: Array<{ name: string; value: number }>;
}

interface MembersData {
  members: {
    [key: string]: MemberData;
  }
}

interface MonthlyData {
  monthlyData: Array<{
    month: string
    expenses: number
    budget: number
    savings: number
  }>
}

import {
  Wallet,
  CreditCard,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  PercentCircle
} from 'lucide-react'
import { Progress } from "@/components/ui/progress"

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
}

interface MemberCardProps {
  membersData: MembersData
}

interface SummaryCardProps {
  overviewData: OverviewData
}



const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}


const MemberCard: React.FC<MemberCardProps> = ({ membersData }) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800">Member Details</CardTitle>
            <CardDescription>Breakdown by member</CardDescription>
          </div>
          <Wallet className="w-8 h-8 text-blue-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(membersData.members).map(([member, data]) => (
            <div key={member} className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{member}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Spent/Budget</span>
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
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-semibold">{formatCurrency(data.totalBudget)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500">Spent</p>
                    <p className="font-semibold">{formatCurrency(data.totalSpent)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  {data.categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-white">
                      <span className="text-sm text-gray-600">{category.name}</span>
                      <span className="font-medium">{formatCurrency(category.value)}</span>
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

const SummaryCard: React.FC<SummaryCardProps> = ({ overviewData }) => {
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
            <CardTitle className="text-xl text-gray-800">Summary</CardTitle>
            <CardDescription>Overall financial status</CardDescription>
          </div>
          <PiggyBank className="w-8 h-8 text-green-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Progress 
            value={spendPercentage}
            className="h-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <p className="text-gray-600 font-medium">Total Budget</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(overviewData.totalBudget)}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownCircle className="w-5 h-5 text-red-500" />
              <p className="text-gray-600 font-medium">Total Spent</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(overviewData.totalSpent)}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3 mb-2">
              <PiggyBank className="w-5 h-5 text-green-500" />
              <p className="text-gray-600 font-medium">Remaining</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(overviewData.totalBudget - overviewData.totalSpent)}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3 mb-2">
              <PercentCircle className="w-5 h-5 text-purple-500" />
              <p className="text-gray-600 font-medium">Spend Percentage</p>
            </div>
            <p className={`text-2xl font-bold ${getStatusColor(spendPercentage)}`}>
              {spendPercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


interface FinancialReportProps {
  overviewData: OverviewData
  membersData: MembersData
  monthlyData: MonthlyData
}

export default function FinancialReport({
  overviewData,
  membersData,
  monthlyData
}: FinancialReportProps) {
  const handleExport = () => {
    exportToExcel(overviewData, membersData, monthlyData)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Financial Report</h1>
        <Button onClick={handleExport}>Export to Excel</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Expenses, Budget, and Savings</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={monthlyData.monthlyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Distribution of expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={overviewData.categoryData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Member Expenses</CardTitle>
            <CardDescription>Total spent by each member</CardDescription>
          </CardHeader>
          <CardContent>
            <MemberBarChart data={overviewData.memberData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentExpensesTable expenses={overviewData.recentExpenses} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MemberCard membersData={membersData} />
        <SummaryCard overviewData={overviewData} />
        </div>
    </div>
  )
}

