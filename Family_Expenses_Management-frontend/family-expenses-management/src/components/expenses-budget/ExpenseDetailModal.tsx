import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from 'date-fns'

interface ExpenseDetailModalProps {
  isOpen: boolean
  onClose: () => void
  expense: {
    id: number
    amount: number
    category: string
    date: string
    description: string
  } | null
}

export default function ExpenseDetailModal({ isOpen, onClose, expense }: ExpenseDetailModalProps) {
  if (!expense) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Amount:</span>
            <span className="col-span-3">${expense.amount.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Category:</span>
            <span className="col-span-3">{expense.category}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Date:</span>
            <span className="col-span-3">{format(new Date(expense.date), 'MMMM d, yyyy')}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Description:</span>
            <span className="col-span-3">{expense.description}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

