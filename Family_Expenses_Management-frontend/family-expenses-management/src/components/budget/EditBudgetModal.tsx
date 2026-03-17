'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getCategories, getMemberFamily, UpdateBudget } from '@/service/API';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
interface Budget {
  _id: string;
  amount: string;
  category_name: string;
  month: string;
  user_id?: string;
  fullname?: string;
  category_id: string,
  year: string
  status?: 'approved' | 'pending' | 'rejected';
}

interface EditBudgetModalProps {
  budget: Budget;
  isOpen: boolean;
  onClose: () => void;
  fetchBudgets: () => void
}

const EditBudgetModal: React.FC<EditBudgetModalProps> = ({ fetchBudgets, budget, isOpen, onClose }) => {
  const [editedBudget, setEditedBudget] = useState<Budget>({
    _id: '',
    amount: '',
    category_name: '',
    month: '',
    user_id: '',
    fullname: '',
    year: '',
    category_id: ''
  });
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [members, setMembers] = useState<{ _id: string; fullname: string }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast()
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
    fetchCategories();
    if (adminStatus) {
      fetchMembers();
    }
  }, []);

  useEffect(() => {
    setEditedBudget(budget)
  }, [budget])

  const handleUpdateBudget = async () => {
    console.log(editedBudget)
    try {
        await UpdateBudget(
          editedBudget._id as string,
          editedBudget.user_id as string,
          editedBudget.category_id as string,
          editedBudget.amount as string,
          editedBudget.month as string,
          editedBudget.year as string
        )
        fetchBudgets()
        toast({
          title: "Cập nhật thành công!",
          })
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        console.log(e)
          // toast({
          // variant: "destructive",
          // title: "Uh oh! Đã có lỗi xảy ra",
          // description: e.response?.data?.detail || "Unknown error",
          // });
      } else {
          console.error("An unexpected error occurred:", e);
      }
  }
    onClose()
  }

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await getMemberFamily();
      setMembers(data.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateBudget()
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={editedBudget.amount}
                onChange={(e) => setEditedBudget({ ...editedBudget, amount: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select 
                value={categories.find(cat => cat._id === editedBudget.category_id)?.name || ''} 
                onValueChange={(value) => {
                    const selectedCat = categories.find(cat => cat.name === value);
                    if(selectedCat) {
                        setEditedBudget({ ...editedBudget, category_id: selectedCat?._id })
                    }
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="month" className="text-right">
                Month
              </Label>
              <Input
                id="month"
                type="month"
                value={editedBudget.month}
                onChange={(e) => setEditedBudget({ ...editedBudget, month: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            {isAdmin && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="member" className="text-right">
                  Member
                </Label>
                <Select 
                  value={members.find(member => member._id === editedBudget.user_id)?.fullname || ''} 
                  onValueChange={(value) => {
                    const selectedMember = members.find(member => member.fullname === value);
                    if(selectedMember) {
                      setEditedBudget({ ...editedBudget, user_id: selectedMember._id })
                    }
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member, index) => (
                      <SelectItem key={index} value={member.fullname}>
                        {member.fullname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBudgetModal;

