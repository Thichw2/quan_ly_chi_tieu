import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createNewExpenses, getCategories } from '@/service/API'
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
        await createNewExpenses(newExpense._id as string, newExpense.amount as number, newExpense.date as string, newExpense.description as string)
        fetchExpenses()
        toast({
            title: "Tạo expense mới thành công!",
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
    setIsLoading(false)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreateMewExpense()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                    Category
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
                    <SelectValue placeholder="Select a category" />
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

                {/* Amount Input */}
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                    Amount
                </Label>
                <Input
                    id="amount"
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                    className="col-span-3"
                />
                </div>

                {/* Date Input */}
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                    Date
                </Label>
                <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="col-span-3"
                />
                </div>

                {/* Description Input */}
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                    Description
                </Label>
                <Input
                    id="description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="col-span-3"
                />
                </div>
            </div>

            <DialogFooter>
                <Button disabled={isLoading} type="submit">
                    {isLoading && (<Loader2 className="animate-spin" />)}
                    Add Expense
                    </Button>
            </DialogFooter>
            </form>
      </DialogContent>
    </Dialog>
  )
}

