import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from 'date-fns'

interface Budget {
  id: number
  amount: number
  category: string
  period: string
}

interface BudgetListProps {
  budgets: Budget[]
  onBudgetClick: (budget: Budget) => void
}

export default function BudgetList({ budgets, onBudgetClick }: BudgetListProps) {
  const groupedBudgets = budgets.reduce((acc, budget) => {
    if (!acc[budget.period]) {
      acc[budget.period] = []
    }
    acc[budget.period].push(budget)
    return acc
  }, {} as Record<string, Budget[]>)

  return (
    <div className="space-y-8">
      {Object.entries(groupedBudgets).map(([period, periodBudgets]) => (
        <div key={period}>
          <h3 className="text-lg font-semibold mb-2">{format(new Date(period), 'MMMM yyyy')}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periodBudgets.map((budget) => (
                <TableRow 
                  key={budget.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => onBudgetClick(budget)}
                >
                  <TableCell>{budget.category}</TableCell>
                  <TableCell className="text-right">${budget.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">
                  ${periodBudgets.reduce((sum, budget) => sum + budget.amount, 0).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
}

