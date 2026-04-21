'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createNewExpenses, getCategories, getBudgets, RequestBudget } from '@/service/API'
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
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

interface Category{
    _id: string,
    name: string,
    family_id: string
}

interface AddExpenseModalProps {
fetchExpenses: () => void,
  isOpen: boolean
  onClose: () => void
}

export const AddExpenseModal = ({ isOpen, onClose, fetchExpenses }: AddExpenseModalProps) => {
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    _id: '',
    category_name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])

  const handleGetCategories = async () => {
    try {
        const data = await getCategories()
        setCategories(data.data)
    } catch (e) {
        console.log(e)
    }
  }

  useEffect(() => {
    handleGetCategories()
  }, [])

  const handleCreateMewExpense = async () => {
    setIsLoading(true)
    try {
        // Kiểm tra dữ liệu đầu vào phía client
        if (!newExpense._id) {
            toast({ variant: 'destructive', title: 'Vui lòng chọn danh mục' })
            setIsLoading(false)
            return
        }
        if (!newExpense.amount || Number(newExpense.amount) <= 0) {
            toast({ variant: 'destructive', title: 'Số tiền phải lớn hơn 0' })
            setIsLoading(false)
            return
        }
        if (!newExpense.date) {
            toast({ variant: 'destructive', title: 'Vui lòng chọn ngày' })
            setIsLoading(false)
            return
        }

        // Kiểm tra xem đã có ngân sách cho danh mục/tháng/năm này chưa
        try {
          const budgetsResp = await getBudgets()
          const budgets = budgetsResp.data || []
          const [yearStr, monthStr] = (newExpense.date || '').split('-')
          const periodMonth = monthStr ? Number(monthStr) : undefined
          const periodYear = yearStr ? Number(yearStr) : undefined
          
          const found = budgets.find((b: any) => 
            b.category_id === newExpense._id && 
            Number(b.month) === periodMonth && 
            Number(b.year) === periodYear
          )

          if (!found) {
            // Nếu chưa có ngân sách -> gửi yêu cầu tạo ngân sách tới admin
            await RequestBudget(newExpense._id as string, `${yearStr}-${monthStr}`, String(newExpense.amount))
            toast({ 
                title: 'Đã gửi yêu cầu tạo ngân sách', 
                description: 'Danh mục này chưa có ngân sách cho tháng này. Vui lòng đợi admin phê duyệt.' 
            })
            setIsLoading(false)
            onClose()
            return
          }
        } catch (e) {
          console.error('Không thể kiểm tra ngân sách:', e)
        }

        await createNewExpenses(newExpense._id as string, newExpense.amount as number, newExpense.date as string, newExpense.description as string)
        fetchExpenses()
        toast({
            title: "Thành công!",
            description: "Đã thêm khoản chi tiêu mới."
          })
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
          const serverMsg = e.response?.data?.detail || e.response?.data?.message || "Lỗi máy chủ"
          toast({
            variant: "destructive",
            title: "Đã có lỗi xảy ra",
            description: serverMsg,
          });
        } else {
          toast({ variant: 'destructive', title: 'Lỗi không xác định' })
        }
    }
    setIsLoading(false)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreateMewExpense()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm chi tiêu mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                {/* Chọn danh mục */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                        Danh mục
                    </Label>
                    <div className="col-span-3">
                        <Select 
                            value={categories.find(cat => cat._id === newExpense._id)?.name || ''}
                            onValueChange={(value) => {
                                const selectedCat = categories.find(cat => cat.name === value);
                                setNewExpense({ ...newExpense, _id: selectedCat?._id })
                            }}
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Chọn một danh mục" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {categories.map((category) => (
                                        <SelectItem key={category._id} value={category.name}> 
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Nhập số tiền */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                        Số tiền
                    </Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="0"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                        className="col-span-3"
                        required
                    />
                </div>

                {/* Chọn ngày */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                        Ngày
                    </Label>
                    <Input
                        id="date"
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                        className="col-span-3"
                        required
                    />
                </div>

                {/* Nhập mô tả */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                        Ghi chú
                    </Label>
                    <Input
                        id="description"
                        placeholder="Ăn sáng, mua sắm..."
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        className="col-span-3"
                    />
                </div>
            </div>

            <DialogFooter>
                <Button disabled={isLoading} type="submit" className="w-full sm:w-auto">
                    {isLoading && (<Loader2 className="mr-2 h-4 w-4 animate-spin" />)}
                    Thêm chi tiêu
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}