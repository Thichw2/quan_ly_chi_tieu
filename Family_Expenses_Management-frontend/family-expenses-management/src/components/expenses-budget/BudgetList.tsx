'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from 'date-fns'
import { vi } from 'date-fns/locale' // Import ngôn ngữ tiếng Việt

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
  // Nhóm các ngân sách theo khoảng thời gian (tháng/năm)
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
        <div key={period} className="border rounded-lg p-4 bg-card shadow-sm">
          {/* Định dạng: Tháng 04 năm 2026 */}
          <h3 className="text-lg font-semibold mb-4 text-primary capitalize">
            {format(new Date(period), "'Tháng' MM 'năm' yyyy", { locale: vi })}
          </h3>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Danh mục</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periodBudgets.map((budget) => (
                <TableRow 
                  key={budget.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onBudgetClick(budget)}
                >
                  <TableCell className="font-medium">{budget.category}</TableCell>
                  <TableCell className="text-right font-mono">
                    {budget.amount.toLocaleString('vi-VN')} VNĐ
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Hàng tổng cộng của từng tháng */}
              <TableRow className="bg-muted/30">
                <TableCell className="font-bold">Tổng cộng</TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {periodBudgets
                    .reduce((sum, budget) => sum + budget.amount, 0)
                    .toLocaleString('vi-VN')} VNĐ
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ))}

      {/* Hiển thị khi không có dữ liệu */}
      {budgets.length === 0 && (
        <div className="text-center py-10 text-muted-foreground italic">
          Chưa có ngân sách nào được thiết lập.
        </div>
      )}
    </div>
  )
}