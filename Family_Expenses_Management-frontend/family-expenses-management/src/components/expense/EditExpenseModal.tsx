import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateExpense } from '@/service/API'
import { useToast } from "@/hooks/use-toast"
import { AxiosError } from 'axios'
import { getCategories } from '@/service/API'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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


interface EditExpenseModalProps {
  expense: Partial<Expense>
  isOpen: boolean
  onClose: () => void
  fetchExpenses: () => void
}

export const EditExpenseModal = ({ expense, isOpen, onClose, fetchExpenses }: EditExpenseModalProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [editedExpense, setEditedExpense] = useState<Partial<Expense>>({
    _id: '',
    category_name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    setEditedExpense(expense);
  }, [expense])

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

  const handleEditExpense = async () => {
    try {
      await updateExpense(expense._id as string,editedExpense.category_id as string, editedExpense.amount as number, editedExpense.date as string, editedExpense.description as string)
      toast({
        title: "Sửa Expense thành công!",
      })
      fetchExpenses()
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
  onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(editedExpense)
    console.log(expense)
    handleEditExpense()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <div className='col-span-3'>
               <Select 
                  value={categories.find(cat => cat._id === editedExpense._id)?.name || ''}
                  onValueChange={(value) => {
                    const selectedCat = categories.find(cat => cat.name === value);
                    setEditedExpense({ ...editedExpense, _id: selectedCat?._id })
                  }}
                >
                    <SelectTrigger className='w-full'>
                    <SelectValue placeholder={expense.category_name} />
                    </SelectTrigger>
                    <SelectContent className='w-full'>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={editedExpense.amount || 0}  // thêm || 0
                onChange={(e) => setEditedExpense({ ...editedExpense, amount: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={editedExpense.date?.split('T')[0] || new Date().toISOString().split('T')[0]}
                onChange={(e) => setEditedExpense({ ...editedExpense, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={editedExpense.description || ''}  // thêm || ''
                onChange={(e) => setEditedExpense({ ...editedExpense, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

