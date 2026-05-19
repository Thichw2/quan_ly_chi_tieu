'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from 'lucide-react'
import { EditExpenseModal } from '../expense/EditExpenseModal'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

import { deleteExpense } from '@/service/API'
import { AxiosError } from 'axios'

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

interface ExpenseListProps {
  expenses: Expense[]
  fetchExpenses : () => void
  isReadOnly?: boolean
}

const ExpenseList = ({ expenses, fetchExpenses, isReadOnly }: ExpenseListProps) => {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null)
  const { toast } = useToast()
  const currentUserId = localStorage.getItem('user_id')

  const handleDeleteExpense = async () => {
    try {
      await deleteExpense(deletingExpenseId as string)
      toast({
        title: "Xóa khoản chi thành công!",
      })
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        toast({
          variant: "destructive",
          title: "Đã xảy ra lỗi!",
          description: e.response?.data?.detail || "Không thể xóa khoản chi này.",
        });
      } else {
        console.error("An unexpected error occurred:", e);
      }
    }
    fetchExpenses()
  }

  return (
    <>
      <div className='w-full h-full container mx-auto p-4 bg-white rounded-lg shadow-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người chi</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Ngày chi</TableHead>
              <TableHead>Ghi chú</TableHead>
              {!isReadOnly && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell className="font-semibold text-slate-700">{expense.fullname}</TableCell>
                  <TableCell className="font-medium">{expense.category_name}</TableCell>
                  <TableCell>
                    {expense.amount.toLocaleString('vi-VN')} VNĐ
                  </TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{expense.description || "—"}</TableCell>
                  {!isReadOnly && (
                    <TableCell className="text-right">
                      {expense.user_id === currentUserId && (
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setEditingExpense(expense)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => setDeletingExpenseId(expense._id)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isReadOnly ? 5 : 6} className="text-center py-10 text-gray-500 italic">
                  Chưa có khoản chi nào được ghi lại.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Chỉnh sửa */}
      {editingExpense && (
        <EditExpenseModal
          fetchExpenses={fetchExpenses}
          expense={editingExpense}
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}

      {/* Hộp thoại xác nhận xóa */}
      <AlertDialog open={!!deletingExpenseId} onOpenChange={() => setDeletingExpenseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Khoản chi tiêu này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (deletingExpenseId) {
                  setDeletingExpenseId(null)
                  handleDeleteExpense()
                }
              }}
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ExpenseList