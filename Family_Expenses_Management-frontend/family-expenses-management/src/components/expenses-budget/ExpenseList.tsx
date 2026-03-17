import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from 'lucide-react'
import { EditExpenseModal } from '../expense/EditExpenseModal'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
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
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  fetchExpenses : () => void
}

const ExpenseList = ({ expenses,  onDelete, fetchExpenses }: ExpenseListProps) => {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDeleteExpense = async () => {
    try {
      await deleteExpense(deletingExpenseId as string)
      toast({
        title: "Sửa Expense thành công!",
      })
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        toast({
          variant: "destructive",
          title: "Uh oh! Đã có lỗi xảy ra",
          description: e.response?.data?.detail || "Unknown error",
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
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense._id}>
              <TableCell>{expense.category_name}</TableCell>
              <TableCell>${expense.amount.toFixed(2)}</TableCell>
              <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingExpense(expense)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeletingExpenseId(expense._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      {editingExpense && (
        <EditExpenseModal
        fetchExpenses={fetchExpenses}
        expense={editingExpense}
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}

      <AlertDialog open={!!deletingExpenseId} onOpenChange={() => setDeletingExpenseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deletingExpenseId) {
                onDelete(deletingExpenseId)
                setDeletingExpenseId(null)
                handleDeleteExpense()
              }
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
export default ExpenseList