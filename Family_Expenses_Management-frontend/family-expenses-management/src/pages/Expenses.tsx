'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getExpenses, getBudgets } from "@/service/API"
import ExpenseList from '@/components/expenses-budget/ExpenseList'
import { AddExpenseModal } from '@/components/expense/AddExpenseModal'
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'

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
  user_id?: string;
  fullname?: string;
  category_id: string
  year: string
  status?: 'approved' | 'pending' | 'rejected';
}

const Expenses = () => {
  const [totalBudget, setTotalBudget] = useState(0)
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const fetchBudgets = async () => {
    try {
      const data = await getBudgets()
      setBudgets(data.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };
  useEffect(() => {
    fetchExpenses()
    fetchBudgets()
  }, [])

  useEffect(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    setTotalExpenses(total)
  }, [expenses])
  useEffect(() => {
    const total = budgets.reduce((sum, budget) => {
      return sum + parseFloat(budget.amount)
    }, 0)
    setTotalBudget(total)
  }, [budgets])

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses()
      setExpenses(data.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleEditExpense = (updatedExpense: Expense) => {
    setExpenses(expenses.map(expense => 
      expense._id === updatedExpense._id ? updatedExpense : expense
    ))
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense._id !== id))
  }

  return (
    <div className="h-full max-h-[calc(100vh-64px)] overflow-auto bg-gray-100">
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Expenses Overview</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <Progress
              value={(totalExpenses / totalBudget) * 100}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              ${totalExpenses.toFixed(2)} spent of ${totalBudget} budget
            </p>
          </CardContent>
        </Card>

        <ExpenseList 
        fetchExpenses={fetchExpenses}
          expenses={expenses} 
          onEdit={handleEditExpense} 
          onDelete={handleDeleteExpense} 
        />

        <AddExpenseModal 
          fetchExpenses={fetchExpenses}
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      </main>
    </div>
  )
}

export default Expenses
