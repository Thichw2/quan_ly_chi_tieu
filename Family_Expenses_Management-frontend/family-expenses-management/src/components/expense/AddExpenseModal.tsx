'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createNewExpenses, getCategories, getBudgets, RequestBudget, getMemberFamily, checkBudget } from '@/service/API'
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertTriangle } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AxiosError } from 'axios'

interface Category {
    _id: string,
    name: string,
    family_id: string
}

interface Member {
    _id: string
    fullname: string
    username: string
    role: string
}

interface AddExpenseModalProps {
  fetchExpenses: () => void,
  isOpen: boolean
  onClose: () => void
}

interface BudgetCheckResult {
  has_budget: boolean
  budget_amount: number
  current_spent: number
  new_total: number
  would_exceed: boolean
  category_name: string
}

// Format tiền tệ VNĐ
const formatVND = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

export const AddExpenseModal = ({ isOpen, onClose, fetchExpenses }: AddExpenseModalProps) => {
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [targetUserId, setTargetUserId] = useState('')  // '' = self
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  const currentUserId = localStorage.getItem('user_id') || ''

  // State cho dialog xác nhận vượt ngân sách
  const [showBudgetWarning, setShowBudgetWarning] = useState(false)
  const [budgetCheck, setBudgetCheck] = useState<BudgetCheckResult | null>(null)

  const handleGetCategories = async () => {
    try {
        const data = await getCategories()
        setCategories(data.data)
    } catch (e) {
        console.log(e)
    }
  }

  const handleGetMembers = async () => {
    try {
        const data = await getMemberFamily()
        setMembers(data.data || [])
    } catch (e) {
        console.log(e)
    }
  }

  useEffect(() => {
    handleGetCategories()
    if (isAdmin) handleGetMembers()
  }, [])

  // Reset form khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setCategoryId('')
      setAmount(0)
      setDateStr(new Date().toISOString().split('T')[0])
      setDescription('')
      setTargetUserId('')
      setShowBudgetWarning(false)
      setBudgetCheck(null)
    }
  }, [isOpen])

  // Thực sự tạo chi tiêu (sau khi đã xác nhận)
  const doCreateExpense = async () => {
    setIsLoading(true)
    try {
      const resolvedTargetUserId = isAdmin && targetUserId ? targetUserId : undefined
      await createNewExpenses(categoryId, amount, dateStr, description, resolvedTargetUserId)
      fetchExpenses()
      toast({
        title: "Thành công!",
        description: isAdmin && targetUserId && targetUserId !== currentUserId
          ? `Đã thêm chi tiêu cho thành viên. Thành viên sẽ nhận được thông báo.`
          : "Đã thêm khoản chi tiêu mới.",
      })
      onClose()
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        const serverMsg = e.response?.data?.detail || e.response?.data?.message || "Lỗi máy chủ"
        toast({
          variant: "destructive",
          title: "Đã có lỗi xảy ra",
          description: serverMsg,
        });
      } else {
        toast({ variant: 'destructive', title: 'Lỗi không xác định', description: 'Vui lòng thử lại sau.' })
      }
    }
    setIsLoading(false)
  }

  const handleCreateNewExpense = async () => {
    setIsLoading(true)
    try {
        if (!categoryId) {
            toast({ variant: 'destructive', title: 'Vui lòng chọn danh mục' })
            setIsLoading(false)
            return
        }
        if (!amount || Number(amount) <= 0) {
            toast({ variant: 'destructive', title: 'Số tiền phải lớn hơn 0' })
            setIsLoading(false)
            return
        }
        if (!dateStr) {
            toast({ variant: 'destructive', title: 'Vui lòng chọn ngày' })
            setIsLoading(false)
            return
        }

        // Nếu là member, kiểm tra ngân sách trước
        if (!isAdmin) {
          try {
            const budgetsResp = await getBudgets()
            const budgets = budgetsResp.data || []
            const [yearStr, monthStr] = (dateStr || '').split('-')
            const periodMonth = monthStr ? Number(monthStr) : undefined
            const periodYear = yearStr ? Number(yearStr) : undefined
            
            const found = budgets.find((b: any) => 
              b.category_id === categoryId && 
              Number(b.month) === periodMonth && 
              Number(b.year) === periodYear
            )

            if (!found) {
              await RequestBudget(categoryId, `${yearStr}-${monthStr}`, String(amount))
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
        }

        // Kiểm tra ngân sách trước khi tạo chi tiêu
        try {
          const resolvedTarget = isAdmin && targetUserId ? targetUserId : undefined
          const budgetResp = await checkBudget(categoryId, amount, dateStr, resolvedTarget)
          const result: BudgetCheckResult = budgetResp.data

          if (result.has_budget && result.would_exceed) {
            // Vượt ngân sách → hiển thị dialog xác nhận
            setBudgetCheck(result)
            setShowBudgetWarning(true)
            setIsLoading(false)
            return
          }
        } catch (e) {
          // Nếu check-budget API lỗi, vẫn cho phép tạo chi tiêu
          console.error('Budget check failed, proceeding:', e)
        }

        // Không vượt ngân sách → tạo trực tiếp
        await doCreateExpense()
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
        setIsLoading(false)
    }
  }

  // Xác nhận vượt ngân sách → tạo chi tiêu
  const handleConfirmOverBudget = async () => {
    setShowBudgetWarning(false)
    await doCreateExpense()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreateNewExpense()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Thêm chi tiêu mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">

                  {/* Admin: chọn thành viên */}
                  {isAdmin && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="member" className="text-right text-sm">
                            Thành viên
                        </Label>
                        <div className="col-span-3">
                            <Select
                                value={targetUserId || currentUserId}
                                onValueChange={(val) => setTargetUserId(val === currentUserId ? '' : val)}
                            >
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder="Chọn thành viên" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {members.map((m) => (
                                            <SelectItem key={m._id} value={m._id}>
                                                {m.fullname} {m._id === currentUserId ? '(Tôi)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                  )}

                  {/* Chọn danh mục */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right text-sm">
                          Danh mục
                      </Label>
                      <div className="col-span-3">
                          <Select 
                              value={categoryId}
                              onValueChange={(val) => setCategoryId(val)}
                          >
                              <SelectTrigger className='w-full'>
                                  <SelectValue placeholder="Chọn một danh mục" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectGroup>
                                      {categories.map((category) => (
                                          <SelectItem key={category._id} value={category._id}> 
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
                      <Label htmlFor="amount" className="text-right text-sm">
                          Số tiền
                      </Label>
                      <Input
                          id="amount"
                          type="number"
                          placeholder="0"
                          value={amount || ''}
                          onChange={(e) => setAmount(parseFloat(e.target.value))}
                          className="col-span-3"
                          required
                          min={1}
                      />
                  </div>

                  {/* Chọn ngày */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right text-sm">
                          Ngày
                      </Label>
                      <Input
                          id="date"
                          type="date"
                          value={dateStr}
                          onChange={(e) => setDateStr(e.target.value)}
                          className="col-span-3"
                          required
                      />
                  </div>

                  {/* Nhập mô tả */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right text-sm">
                          Ghi chú
                      </Label>
                      <Input
                          id="description"
                          placeholder="Ăn sáng, mua sắm..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="col-span-3"
                      />
                  </div>
              </div>

              <DialogFooter>
                  <Button disabled={isLoading} type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                      {isLoading && (<Loader2 className="mr-2 h-4 w-4 animate-spin" />)}
                      Thêm chi tiêu
                  </Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận khi vượt ngân sách */}
      <AlertDialog open={showBudgetWarning} onOpenChange={setShowBudgetWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Cảnh báo vượt ngân sách!
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Khoản chi tiêu này sẽ khiến tổng chi tiêu vượt quá ngân sách đã phân bổ cho
                  danh mục <strong className="text-foreground">"{budgetCheck?.category_name}"</strong>.
                </p>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ngân sách phân bổ:</span>
                    <span className="font-semibold text-foreground">{formatVND(budgetCheck?.budget_amount ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Đã chi tiêu:</span>
                    <span className="font-medium text-foreground">{formatVND(budgetCheck?.current_spent ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Khoản thêm:</span>
                    <span className="font-medium text-blue-600">+{formatVND(amount)}</span>
                  </div>
                  <hr className="border-amber-200" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-semibold">Tổng sau khi thêm:</span>
                    <span className="font-bold text-red-600">{formatVND(budgetCheck?.new_total ?? 0)}</span>
                  </div>
                </div>
                <p className="text-sm font-medium">
                  Bạn có chắc chắn vẫn muốn thêm khoản chi tiêu này không?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmOverBudget}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Vẫn tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}