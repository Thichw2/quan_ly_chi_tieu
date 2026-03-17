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

  return (
    <div className="h-full max-h-[calc(100vh-64px)] overflow-auto bg-gray-100">
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Budget Overview</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
            <Progress 
              value={totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0} 
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              ${totalExpenses.toFixed(2)} spent of ${totalBudget.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <BudgetManagement getBudget={getBudget}/>
      </main>
    </div>
  )
}