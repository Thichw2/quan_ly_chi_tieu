'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale" // Import locale tiếng Việt

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
          <DialogTitle>Chi tiết ngân sách</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Số tiền */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-right">Số tiền:</span>
            <span className="col-span-3">
              {budget.amount.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
          
          {/* Danh mục */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-right">Danh mục:</span>
            <span className="col-span-3">{budget.category}</span>
          </div>
          
          {/* Thời gian */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-right">Kỳ hạn:</span>
            <span className="col-span-3 capitalize">
              {format(new Date(budget.period), "'Tháng' MM yyyy", { locale: vi })}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="secondary">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}