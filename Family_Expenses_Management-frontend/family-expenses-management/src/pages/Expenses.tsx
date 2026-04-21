'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getExpenses, getBudgets } from "@/service/API"
import ExpenseList from '@/components/expenses-budget/ExpenseList'
import { AddExpenseModal } from '@/components/expense/AddExpenseModal'
import { Button } from "@/components/ui/button"
import { Plus, Wallet, AlertCircle } from 'lucide-react'

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

interface Budget {
  _id: string;
  amount: string;
  category_name: string;
  month: string;
  year: string;
  category_id: string
  status?: 'approved' | 'pending' | 'rejected';
}

const Expenses = () => {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Lấy tháng và năm hiện tại để hiển thị tiêu đề
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Định dạng tiền tệ cho VNĐ
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const fetchBudgets = async () => {
    try {
      const data = await getBudgets()
      // Đảm bảo lấy đúng mảng dữ liệu dù API trả về data.data hay data
      const budgetData = data.data || data || []
      setBudgets(budgetData)
    } catch (error) {
      console.error('Lỗi khi tải ngân sách:', error)
    }
  }

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses()
      const expenseData = data.data || data || []
      setExpenses(expenseData)
    } catch (e) {
      console.error('Lỗi khi tải chi tiêu:', e)
    }
  }

  useEffect(() => {
    fetchExpenses()
    fetchBudgets()
  }, [])

  // Logic tính toán: Đã sửa để khớp với logic file Budget của Tiến
  const { totalExpenses, totalBudget, percentage, isOverBudget } = useMemo(() => {
    // 1. Tính tổng chi tiêu (Cộng dồn tất cả amount)
    const totalExp = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

    // 2. Tính tổng ngân sách (Cộng dồn tất cả budget.amount)
    const totalBud = budgets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0)

    // 3. Tính phần trăm
    const percent = totalBud > 0 ? (totalExp / totalBud) * 100 : 0
    
    return { 
      totalExpenses: totalExp, 
      totalBudget: totalBud, 
      percentage: percent,
      isOverBudget: totalExp > totalBud && totalBud > 0
    }
  }, [expenses, budgets])

  return (
    <div className="h-full max-h-[calc(100vh-64px)] overflow-auto bg-gray-50/50">
      <main className="container mx-auto p-4 md:p-8">
        {/* Phần Tiêu đề */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý chi tiêu</h1>
            <p className="text-muted-foreground text-sm italic">
              Dữ liệu tổng hợp hệ thống (Tháng {currentMonth}/{currentYear})
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="shadow-sm bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Thêm chi tiêu
          </Button>
        </div>

        {/* Thẻ So sánh Ngân sách */}
        <Card className="mb-8 border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Trạng thái ngân sách tổng quát
            </CardTitle>
            <Wallet className={`h-5 w-5 ${isOverBudget ? "text-red-500" : "text-blue-500"}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${isOverBudget ? "text-red-600" : "text-slate-900"}`}>
                  {formatCurrency(totalExpenses)}
                </span>
                <span className="text-sm text-muted-foreground font-medium">đã chi</span>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className={isOverBudget ? "text-red-500" : "text-slate-600"}>
                  Tiến độ sử dụng ngân sách
                </span>
                <span className="font-bold">{percentage.toFixed(1)}%</span>
              </div>

              <Progress
                value={Math.min(percentage, 100)} 
                className={`h-3 ${isOverBudget ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-600"}`}
              />
              
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground italic">
                  Hạn mức tối đa: {formatCurrency(totalBudget)}
                </p>
              </div>
            </div>

            {isOverBudget && (
              <div className="flex items-center gap-3 mt-6 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-semibold">
                  Cảnh báo: Tổng chi tiêu đã vượt quá ngân sách cho phép!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danh sách giao dịch */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            <ExpenseList 
              fetchExpenses={fetchExpenses}
              expenses={expenses} 
              onEdit={fetchExpenses} 
              onDelete={fetchExpenses} 
            />
        </div>

        {/* Modal thêm chi tiêu */}
        <AddExpenseModal 
          fetchExpenses={fetchExpenses}
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      </main>
    </div>
  )
}

export default Expenses;