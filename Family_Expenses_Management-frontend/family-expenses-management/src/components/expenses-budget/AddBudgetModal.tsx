'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getCategories, getMemberFamily } from '@/service/API';
import { adminAddBudget, RequestBudget } from '@/service/API';
import { useToast } from '@/hooks/use-toast'
import { AxiosError } from 'axios';

interface FamilyMember {
  id: string;
  name: string;
}
interface Member {
  _id: string;
  fullname: string;
  username: string;
  role: string;
  email: string;
  specifcRole: string
}

interface Category {
  _id: string;
  name: string;
}

interface AddBudgetModalProps {
  fetchBudgets: () => void
  isOpen: boolean;
  onClose: () => void;
}

// Dịch lỗi backend sang tiếng Việt thân thiện
const translateError = (detail?: string): string => {
  if (!detail) return "Lỗi không xác định. Vui lòng thử lại.";
  const errorMap: Record<string, string> = {
    "Budget for this category and user already exists for the specified month and year.":
      "Ngân sách cho danh mục và thành viên này đã tồn tại trong tháng/năm đã chọn.",
    "Only admin can create budgets.":
      "Chỉ quản trị viên mới có thể tạo ngân sách.",
    "Category not found.":
      "Không tìm thấy danh mục. Vui lòng kiểm tra lại.",
    "User not found in the family.":
      "Thành viên không thuộc gia đình của bạn.",
    "Invalid category ID format.":
      "Mã danh mục không hợp lệ.",
    "Invalid user ID format.":
      "Mã thành viên không hợp lệ.",
    "Insufficient permissions":
      "Bạn không có quyền thực hiện thao tác này.",
  };
  return errorMap[detail] || detail;
};

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose, fetchBudgets }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [period, setPeriod] = useState('');
  const [memberId, setMemberId] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast()

  const handleRequestBudget = async () => {
    try {
      await RequestBudget(category, period, amount)
      fetchBudgets()
      toast({
        title: "Gửi yêu cầu ngân sách thành công!",
      })
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        toast({
          variant: "destructive",
          title: "Đã xảy ra lỗi!",
          description: translateError(e.response?.data?.detail),
        });
      } else {
        toast({ variant: "destructive", title: "Lỗi không xác định", description: "Vui lòng thử lại sau." });
      }
      throw e; // Re-throw để handleSubmit biết có lỗi
    }
  }

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);

    if (adminStatus) {
      fetchFamilyMembers();
    }
    fetchCategories();
  }, []);

  const handleAdminAddBudget = async () => {
    try {
      await adminAddBudget(category, amount, period, memberId)
      fetchBudgets()
      toast({
        title: "Thiết lập ngân sách thành công!",
      })
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        toast({
          variant: "destructive",
          title: "Đã xảy ra lỗi!",
          description: translateError(e.response?.data?.detail),
        });
      } else {
        toast({ variant: "destructive", title: "Lỗi không xác định", description: "Vui lòng thử lại sau." });
      }
      throw e; // Re-throw để handleSubmit biết có lỗi
    }
  }

  const fetchFamilyMembers = async () => {
    try {
      const data = await getMemberFamily()
      setFamilyMembers(data?.data.map((item: Member) => ({
        id: item._id,
        name: item.fullname,
      })));
    } catch (e) {
      console.log(e)
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data.data)
    } catch (e) {
      console.log(e)
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAdmin) {
        await handleAdminAddBudget();
      } else {
        await handleRequestBudget();
      }
      onClose();
      setAmount('');
      setCategory('');
      setPeriod('');
      setMemberId('');
    } catch {
      // Lỗi đã được xử lý trong handleAdminAddBudget / handleRequestBudget
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[605px]">
        <DialogHeader>
          <DialogTitle>
            {isAdmin ? 'Thiết lập ngân sách mới' : 'Gửi yêu cầu ngân sách mới'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Số tiền */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Số tiền
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            {/* Danh mục */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Danh mục
              </Label>
              <Select 
                value={categories.find(cat => cat._id === category)?.name || ''} 
                onValueChange={(name) => {
                  const selectedCat = categories.find(cat => cat.name === name);
                  setCategory(selectedCat?._id as string);
                }}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Thời gian */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period" className="text-right">
                Tháng
              </Label>
              <Input
                id="period"
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            {/* Thành viên gia đình (Chỉ dành cho Admin) */}
            {isAdmin && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="member" className="text-right">
                  Thành viên
                </Label>
                <Select 
                  value={familyMembers.find(member => member.id === memberId)?.name || ''} 
                  onValueChange={(name) => {
                    const selectedMember = familyMembers.find(member => member.name === name);
                    setMemberId(selectedMember?.id as string);
                  }}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn thành viên gia đình" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyMembers.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="submit">
              {isAdmin ? 'Thiết lập ngay' : 'Gửi yêu cầu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBudgetModal;