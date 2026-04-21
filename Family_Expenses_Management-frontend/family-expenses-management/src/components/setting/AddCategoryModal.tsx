'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateCategories } from '@/service/API'
import { useToast } from "@/hooks/use-toast"
import { AxiosError } from 'axios'
import { Loader2 } from 'lucide-react'

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  fetchCategories: () => void
}

export const AddCategoryModal = ({ isOpen, onClose, fetchCategories }: AddCategoryModalProps) => {
  const { toast } = useToast()
  const [categoryName, setCategoryName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi nhập liệu",
        description: "Vui lòng nhập tên danh mục.",
      });
      return;
    }

    setIsLoading(true)
    try {
      await CreateCategories(categoryName)
      toast({
        title: "Thành công!",
        description: "Đã tạo danh mục mới thành công.",
      })
      fetchCategories()
      setCategoryName('') // Reset field sau khi thành công
      onClose()
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        toast({
          variant: "destructive",
          title: "Đã có lỗi xảy ra",
          description: e.response?.data?.detail || "Không thể tạo danh mục lúc này.",
        });
      } else {
        console.error("An unexpected error occurred:", e);
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreateCategory()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
                placeholder="Ví dụ: Ăn uống, Di chuyển..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo danh mục
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}