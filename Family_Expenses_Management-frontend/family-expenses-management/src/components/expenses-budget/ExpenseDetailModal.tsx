'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from 'date-fns'
import { vi } from 'date-fns/locale' // Import ngôn ngữ tiếng Việt

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
          <DialogTitle>Chi tiết khoản chi</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Số tiền */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-right">Số tiền:</span>
            <span className="col-span-3 text-lg font-semibold text-red-600">
              {expense.amount.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>

          {/* Danh mục */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-right">Danh mục:</span>
            <span className="col-span-3">{expense.category}</span>
          </div>

          {/* Ngày tháng */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-right">Ngày:</span>
            <span className="col-span-3">
              {format(new Date(expense.date), "dd 'Tháng' MM, yyyy", { locale: vi })}
            </span>
          </div>

          {/* Ghi chú/Mô tả */}
          <div className="grid grid-cols-4 items-start gap-4">
            <span className="font-bold text-right">Ghi chú:</span>
            <span className="col-span-3 italic text-gray-600">
              {expense.description || "Không có mô tả"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}