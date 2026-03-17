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
      
      // Clear just this category's amount
      setAmounts(prev => ({
        ...prev,
        [categoryId]: ''
      }));
    }
  };

  const handleNextMember = () => {
    if (currentMemberIndex < members.length - 1) {
      setCurrentMemberIndex(currentMemberIndex + 1);
      setAmounts({}); // Clear all amounts for next member
    }
  };

  if (members.length === 0) {
    return <div>No family members added yet.</div>;
  }

  if (currentMemberIndex >= members.length) {
    return <div>All budgets set successfully!</div>;
  }

  const currentMember = members[currentMemberIndex];
  const memberBudgets = budgets.filter(b => b.memberId === currentMember.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Set Budget for {currentMember.name}</h3>
        <Button onClick={handleNextMember}>Next Member</Button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => {
          const existingBudget = memberBudgets.find(b => b.categoryId === category.id);
          
          return (
            <Card key={category.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`budget-${category.id}`}>{category.name}</Label>
                    {existingBudget && (
                      <span className="text-sm text-gray-500">
                        Current: ${existingBudget.amount}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id={`budget-${category.id}`}
                      type="number"
                      placeholder="Enter budget amount (optional)"
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
                      Set
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Current Budgets for {currentMember.name}:</h4>
        {memberBudgets.length > 0 ? (
          <ul className="space-y-2">
            {memberBudgets.map((budget) => (
              <li key={`${budget.memberId}-${budget.categoryId}`}>
                {categories.find(c => c.id === budget.categoryId)?.name}: ${budget.amount}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No budgets set yet</p>
        )}
      </div>
    </div>
  );
}