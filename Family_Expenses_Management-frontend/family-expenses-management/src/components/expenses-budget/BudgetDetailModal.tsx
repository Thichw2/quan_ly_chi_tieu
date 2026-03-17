import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface BudgetDetailModalProps {
  isOpen: boolean
  onClose: () => void
  budget: {
    id: number
    amount: number
    category: string
    period: string
  } | null
}

export default function BudgetDetailModal({ isOpen, onClose, budget }: BudgetDetailModalProps) {
  if (!budget) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Budget Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Amount:</span>
            <span className="col-span-3">${budget.amount.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Category:</span>
            <span className="col-span-3">{budget.category}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Period:</span>
            <span className="col-span-3">{format(new Date(budget.period), "MMMM yyyy")}</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
