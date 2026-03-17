import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateCategories } from '@/service/API'
import { useToast } from "@/hooks/use-toast"
import { AxiosError } from 'axios'


interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  fetchCategories: () => void
}

export const AddCategoryModal = ({ isOpen, onClose, fetchCategories }: AddCategoryModalProps) => {
  const { toast } = useToast()
  const [categoryName, setCategoryName] = useState<string>('')
    const handleCreateCategory = async () => {
        try {
            await CreateCategories(categoryName)
            toast({
                title: "Tạo danh mục mới thành công!",
              })
              fetchCategories()
        }catch (e: unknown) {
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
    } 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreateCategory()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm danh mục mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên danh mục
              </Label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="col-span-3"
              />
            </div>
            
          </div>
          <DialogFooter>
            <Button type="submit">Thêm danh mục</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

