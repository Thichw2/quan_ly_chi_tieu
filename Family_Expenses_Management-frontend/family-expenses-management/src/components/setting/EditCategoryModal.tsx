import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCategoryApi } from '@/service/API'
import { useToast } from '@/hooks/use-toast'
import { AxiosError } from 'axios'

interface Category {
  _id: string
  name: string
  family_id: string
}

interface EditCategoryModalProps {
  category: Category
  isOpen: boolean
  onClose: () => void
  fetchCategories: () => void
}

export const EditCategoryModal = ({ category, isOpen, onClose,  fetchCategories }: EditCategoryModalProps) => {
  const [editedCategory, setEditedCategory] = useState<Category>(category)
  const { toast } = useToast()
    const handleUpdateCategory = async () => {
        try {
            await updateCategoryApi(category._id, editedCategory.name)
            toast({
                title: "Sửa danh mục thành công!",
                })
            fetchCategories()
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
    }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleUpdateCategory()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên danh mục
              </Label>
              <Input
                id="name"
                value={editedCategory.name}
                onChange={(e) => setEditedCategory({ ...editedCategory, name: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Lưu thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

