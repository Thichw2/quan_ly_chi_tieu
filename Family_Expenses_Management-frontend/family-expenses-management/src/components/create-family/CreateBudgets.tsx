'use client'

import { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

type Member = {
  id: string;
  name: string;
  isNew: boolean;
  email?: string;
  role?: string;
  specificRole?: string;
}

type Category = {
  id: string;
  name: string;
}

type Budget = {
  memberId: string;
  categoryId: string;
  amount: number;
}

type Props = {
  members: Member[];
  categories: Category[];
  budgets: Budget[];
  setBudget: (budget: Budget) => void;
}

export default function CreateBudgets({ members, categories, budgets, setBudget }: Props) {
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});

  const handleSetBudget = (categoryId: string) => {
    const amount = amounts[categoryId];
    if (amount) {
      setBudget({
        memberId: members[currentMemberIndex].id,
        categoryId,
        amount: parseFloat(amount)
      });
      
      // Xóa số tiền chỉ cho danh mục này sau khi thiết lập
      setAmounts(prev => ({
        ...prev,
        [categoryId]: ''
      }));
    }
  };

  const handleNextMember = () => {
    if (currentMemberIndex < members.length - 1) {
      setCurrentMemberIndex(currentMemberIndex + 1);
      setAmounts({}); // Xóa tất cả các số tiền tạm nhập cho thành viên tiếp theo
    }
  };

  if (members.length === 0) {
    return <div className="p-4 text-center text-gray-500">Chưa có thành viên gia đình nào được thêm.</div>;
  }

  if (currentMemberIndex >= members.length) {
    return <div className="p-4 text-center text-green-600 font-bold">Tất cả ngân sách đã được thiết lập thành công!</div>;
  }

  const currentMember = members[currentMemberIndex];
  const memberBudgets = budgets.filter(b => b.memberId === currentMember.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Thiết lập ngân sách cho: {currentMember.name}</h3>
        <Button onClick={handleNextMember} variant="outline">
          Thành viên tiếp theo
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => {
          const existingBudget = memberBudgets.find(b => b.categoryId === category.id);
          
          return (
            <Card key={category.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`budget-${category.id}`} className="font-medium">
                      {category.name}
                    </Label>
                    {existingBudget && (
                      <span className="text-sm text-blue-600">
                        Hiện tại: {existingBudget.amount.toLocaleString('vi-VN')} VNĐ
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id={`budget-${category.id}`}
                      type="number"
                      placeholder="Nhập số tiền ngân sách..."
                      value={amounts[category.id] || ''}
                      onChange={(e) => setAmounts(prev => ({
                        ...prev,
                        [category.id]: e.target.value
                      }))}
                    />
                    <Button 
                      onClick={() => handleSetBudget(category.id)}
                      disabled={!amounts[category.id]}
                    >
                      Thiết lập
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 border-t pt-4">
        <h4 className="font-semibold mb-2">Danh sách ngân sách của {currentMember.name}:</h4>
        {memberBudgets.length > 0 ? (
          <ul className="space-y-2">
            {memberBudgets.map((budget) => (
              <li key={`${budget.memberId}-${budget.categoryId}`} className="flex justify-between bg-gray-50 p-2 rounded">
                <span>{categories.find(c => c.id === budget.categoryId)?.name}</span>
                <span className="font-bold">{budget.amount.toLocaleString('vi-VN')} VNĐ</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Chưa có ngân sách nào được thiết lập</p>
        )}
      </div>
    </div>
  );
}