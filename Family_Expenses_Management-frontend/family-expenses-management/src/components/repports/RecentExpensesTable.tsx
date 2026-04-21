'use client'

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  BadgeDollarSign,
  Tag,
  User
} from 'lucide-react'

interface Expense {
  id: string
  name: string
  amount: number
  category: string
  member: string
}

interface RecentExpensesTableProps {
  expenses: Expense[]
}

export const RecentExpensesTable: React.FC<RecentExpensesTableProps> = ({ expenses }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const totalPages = Math.ceil(expenses.length / itemsPerPage)
  
  // Lấy danh sách mục cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = expenses.slice(indexOfFirstItem, indexOfLastItem)

  // Định dạng tiền tệ VNĐ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  // Lấy màu sắc cho danh mục (Đã Việt hóa key danh mục)
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Thực phẩm': 'bg-green-100 text-green-800',
      'Di chuyển': 'bg-blue-100 text-blue-800',
      'Mua sắm': 'bg-purple-100 text-purple-800',
      'Giải trí': 'bg-yellow-100 text-yellow-800',
      'Hóa đơn': 'bg-red-100 text-red-800',
      'Ăn uống': 'bg-orange-100 text-orange-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="w-full">
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">Tên khoản chi</TableHead>
                <TableHead className="font-semibold text-gray-700">Số tiền</TableHead>
                <TableHead className="font-semibold text-gray-700">Danh mục</TableHead>
                <TableHead className="font-semibold text-gray-700">Thành viên</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((expense) => (
                  <TableRow 
                    key={expense.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">{expense.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                        <BadgeDollarSign className="w-4 h-4 text-green-600" />
                        {formatCurrency(expense.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="text-sm">{expense.member}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-gray-500 italic">
                    Không có dữ liệu chi tiêu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            Hiển thị <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> đến <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, expenses.length)}</span> trong tổng số <span className="font-medium text-gray-900">{expenses.length}</span> mục
          </div>
          <div className="flex items-center gap-1 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Trang đầu"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Trang trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center px-4">
              <span className="text-sm font-semibold text-gray-700">
                Trang {currentPage} / {totalPages}
              </span>
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Trang sau"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Trang cuối"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}