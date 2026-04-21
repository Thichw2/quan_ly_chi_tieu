'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import BudgetManagement from "@/components/expenses-budget/ExpenseBudgetManager"
import { getExpenses } from "@/service/API"
import { useEffect, useState } from "react"

interface Budget {
  _id: string;
  amount: string;
  category_name: string;
  month: string;
  user_id?: string;
  fullname?: string;
  category_id: string
  year: string
  status?: 'approved' | 'pending' | 'rejected';
}

interface Expense {
  _id: string
  category_id: string
  category_name: string
  user_id: string
  fullname: string
  amount: number
  date: string
  description: string
}

export default function Budget() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalBudget, setTotalBudget] = useState(0)

  const getBudget = (budget: Budget[]) => {
    setBudgets(budget)
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  // Tính tổng chi tiêu khi danh sách expenses thay đổi
  useEffect(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    setTotalExpenses(total)
  }, [expenses])

  // Tính tổng ngân sách khi danh sách budgets thay đổi
  useEffect(() => {
    const total = budgets.reduce((sum, budget) => {
      return sum + parseFloat(budget.amount || "0")
    }, 0)
    setTotalBudget(total)
  }, [budgets])

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses()
      setExpenses(data.data)
    } catch (e) {
      console.error("Lỗi khi tải chi tiêu:", e)
    }
  }

  // Hàm định dạng tiền tệ tiếng Việt
  const formatVNĐ = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const usagePercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0

  return (
    <div className="h-full max-h-[calc(100vh-64px)] overflow-auto bg-slate-50/50">
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-extrabold mb-8 text-slate-900 tracking-tight">
          Tổng quan ngân sách
        </h1>

        <Card className="mb-8 border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-600">
              Tổng ngân sách khả dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatVNĐ(totalBudget)}
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className={usagePercentage > 100 ? "text-red-500" : "text-slate-600"}>
                  Tiến độ sử dụng
                </span>
                <span className="font-bold">{usagePercentage.toFixed(1)}%</span>
              </div>
              
              <Progress 
                value={usagePercentage} 
                className={`h-3 ${usagePercentage > 100 ? "[&>div]:bg-red-500" : ""}`}
              />
              
              <p className="text-sm text-slate-500 italic">
                Đã chi tiêu {formatVNĐ(totalExpenses)} trên tổng số {formatVNĐ(totalBudget)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Component quản lý chi tiết ngân sách */}
        <BudgetManagement getBudget={getBudget}/>
      </main>
    </div>
  )
}