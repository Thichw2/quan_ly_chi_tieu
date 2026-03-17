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
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="expense-category">Expense Categories</Label>
      <div className="flex space-x-2">
        <Input
          id="expense-category"
          placeholder="New category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button onClick={addCategory}>Add</Button>
      </div>
      <ul className="space-y-2">
        {categories.map((category, index) => (
          <li key={index} className="flex justify-between items-center">
            {category}
            <Button variant="destructive" size="sm" onClick={() => removeCategory(category)}>Remove</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

