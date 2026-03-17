'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit } from 'lucide-react'
import { AddCategoryModal } from './AddCategoryModal'
import { EditCategoryModal } from './EditCategoryModal'
import { getCategories } from '@/service/API'

interface Category {
  _id: string
  name: string
  family_id: string
}

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const handleGetCategories = async () => {
    try {
        const data = await getCategories()
        setCategories(data.data)
    } catch (e) {
        console.log(e)
    }
  }
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true'
    setIsAdmin(adminStatus)
    

    if (adminStatus) {
      handleGetCategories()
    }
  }, [])




  if (!isAdmin) {
    return null // Don't render anything if not admin
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Danh sách danh mục</CardTitle>
        <Button onClick={() => setIsAddModalOpen(true)}>
          Thêm danh mục
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Chưa có danh mục nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>ID Gia đình</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.family_id}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
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

