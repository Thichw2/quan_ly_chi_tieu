'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type Props = {
  categories: string[];
  setCategories: (categories: string[]) => void;
}

export default function CreateExpenseCategories({ categories, setCategories }: Props) {
  const [newCategory, setNewCategory] = useState('');

  const addCategory = () => {
    // Kiểm tra nếu có nội dung và không bị trùng lặp
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory();
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="expense-category" className="text-lg font-medium">
        Danh mục chi tiêu
      </Label>
      
      <div className="flex space-x-2">
        <Input
          id="expense-category"
          placeholder="Nhập tên danh mục mới..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={addCategory}>Thêm</Button>
      </div>

      {categories.length > 0 ? (
        <ul className="space-y-2 border rounded-md p-2">
          {categories.map((category, index) => (
            <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
              <span className="text-sm font-medium">{category}</span>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => removeCategory(category)}
              >
                Xóa
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic">Chưa có danh mục nào được tạo.</p>
      )}
    </div>
  );
}