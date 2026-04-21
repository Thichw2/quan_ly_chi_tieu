'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Loader2, Plus } from 'lucide-react'
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

  // Tải danh sách danh mục
  const handleGetCategories = async () => {
    setLoading(true)
    try {
      const response = await getCategories()
      // Đảm bảo lấy mảng dữ liệu từ API
      setCategories(response.data || [])
    } catch (e) {
      console.error(e)
      toast({
        variant: "destructive",
        title: "Lỗi tải dữ liệu",
        description: "Không thể kết nối với máy chủ để tải danh mục."
      })
    } finally {
      setLoading(false)
    }
  }

  // Xử lý xóa danh mục
  const handleDeleteCategory = async (id: string) => {
    // Sử dụng Confirm của trình duyệt (Có thể thay bằng AlertDialog của shadcn nếu muốn đồng bộ UI)
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này? Hành động này có thể ảnh hưởng đến các bản ghi chi tiêu liên quan.")) return;
    
    try {
      await deleteCategoryApi(id)
      toast({ 
        title: "Thành công", 
        description: "Danh mục đã được loại bỏ khỏi hệ thống." 
      })
      handleGetCategories() // Tải lại danh sách sau khi xóa
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Lỗi thực thi",
        description: "Không thể xóa danh mục. Vui lòng kiểm tra lại quyền hạn hoặc kết nối."
      })
    }
  }

  useEffect(() => {
    handleGetCategories()
  }, [])

  return (
    <Card className="shadow-sm border-none md:border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="text-xl font-bold">Quản lý danh mục</CardTitle>
          <p className="text-sm text-muted-foreground pt-1">
            Danh sách các loại hình chi tiêu trong gia đình
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </Button>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Đang tải danh sách...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-slate-50/50">
            <div className="flex justify-center mb-4 text-slate-300">
               {/* Icon rỗng nếu bạn có */}
            </div>
            <p className="text-slate-500 font-medium">Chưa có danh mục chi tiêu nào</p>
            <p className="text-xs text-slate-400 mt-1">Bắt đầu bằng cách thêm danh mục đầu tiên cho gia đình bạn</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[50%] font-semibold">Tên danh mục</TableHead>
                  <TableHead className="font-semibold">ID Gia đình</TableHead>
                  <TableHead className="text-right font-semibold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-semibold text-slate-700">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 font-mono">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                        {category.family_id.substring(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCategory(category)}
                          className="hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category._id)}
                          className="hover:bg-red-50"
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

      {/* Modal Thêm mới */}
      <AddCategoryModal
        fetchCategories={handleGetCategories}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Modal Chỉnh sửa */}
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