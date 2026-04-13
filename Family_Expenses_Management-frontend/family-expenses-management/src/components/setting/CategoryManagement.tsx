'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Loader2 } from 'lucide-react' // Thêm Trash2
import { AddCategoryModal } from './AddCategoryModal'
import { EditCategoryModal } from './EditCategoryModal'
import { getCategories, deleteCategoryApi } from '@/service/API'
import { useToast } from '@/hooks/use-toast'

interface Category {
  _id: string
  name: string
  family_id: string
}

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { toast } = useToast()

  const handleGetCategories = async () => {
    setLoading(true)
    try {
      const response = await getCategories()
      // Đảm bảo lấy đúng mảng dữ liệu từ response của axios
      setCategories(response.data)
    } catch (e) {
      console.error(e)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách danh mục"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    
    try {
      await deleteCategoryApi(id)
      toast({ title: "Thành công", description: "Đã xóa danh mục" })
      handleGetCategories() // Reload lại danh sách
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa danh mục này"
      })
    }
  }

  useEffect(() => {
    handleGetCategories()
  }, [])

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">Quản lý danh mục chi tiêu</CardTitle>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm">
          Thêm danh mục
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-gray-500">Chưa có danh mục nào cho gia đình này</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Tên danh mục</TableHead>
                  <TableHead>Mã gia đình</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-xs text-gray-400 font-mono">
                        {category.family_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AddCategoryModal
        fetchCategories={handleGetCategories}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingCategory && (
        <EditCategoryModal
          fetchCategories={handleGetCategories}
          category={editingCategory}
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </Card>
  )
}