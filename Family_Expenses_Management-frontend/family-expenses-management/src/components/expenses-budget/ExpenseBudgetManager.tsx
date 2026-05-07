'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import AddBudgetModal from './AddBudgetModal';
import EditBudgetModal from '../budget/EditBudgetModal';
import DeleteBudgetDialog from '../budget/DeleteBudgetModal';
import { getBudgets, deleteBudget, BugetPending, ApproveBudget, RejectBudget } from '@/service/API';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

// Dịch lỗi backend sang tiếng Việt
const translateError = (detail?: string): string => {
  if (!detail) return "Lỗi không xác định. Vui lòng thử lại.";
  const map: Record<string, string> = {
    "Only admin can create budgets.": "Chỉ quản trị viên mới có thể tạo ngân sách.",
    "Budget not found.": "Không tìm thấy ngân sách.",
    "Budget này đã có expense, không thể xóa.": "Ngân sách này đã có chi tiêu, không thể xóa.",
    "Insufficient permissions": "Bạn không có quyền thực hiện thao tác này.",
    "Không tìm thấy yêu cầu.": "Không tìm thấy yêu cầu ngân sách.",
    "Yêu cầu đã được xử lý.": "Yêu cầu này đã được xử lý trước đó.",
  };
  return map[detail] || detail;
};

interface Budget {
  _id: string;
  amount: string;
  category_name: string;
  month: string;
  user_id?: string;
  fullname?: string;
  category_id: string;
  year: string;
  status?: 'approved' | 'pending' | 'rejected';
}

interface BudgetRequest {
  _id: string;
  requested_amount: string;
  category_name: string;
  month: string;
  user_id?: string;
  fullname?: string;
  category_id: string;
  year: string;
  status?: 'approved' | 'pending' | 'rejected';
}

interface BudgetManagementProps {
  getBudget: (budget: Budget[]) => void;
  selectedMonth: number;
  selectedYear: number;
  isReadOnly?: boolean;
}

const BudgetManagement: React.FC<BudgetManagementProps> = ({ getBudget, selectedMonth, selectedYear, isReadOnly }) => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [bugetPending, setBudgetPending] = useState<BudgetRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDeleteBudget = async (budgetId: string) => {
    setIsLoading(true);
    try {
      await deleteBudget(budgetId);
      fetchBudgets();
      toast({ title: "Xóa ngân sách thành công!" });
    } catch (e: unknown) {
      const msg = e instanceof AxiosError
        ? translateError(e.response?.data?.detail)
        : "Có lỗi xảy ra khi xóa ngân sách.";
      toast({ variant: "destructive", title: "Đã xảy ra lỗi", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
    if (adminStatus) {
      getBudgetPending();
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const getBudgetPending = async () => {
    try {
      const data = await BugetPending();
      setBudgetPending(data.data || []);
    } catch (e) {
      // Admin 403 hoặc lỗi mạng — không crash, chỉ set rỗng
      setBudgetPending([]);
    }
  };

  const fetchBudgets = async () => {
    try {
      const data = await getBudgets(selectedMonth, selectedYear);
      const budgetData = data.data || [];
      setBudgets(budgetData);
      getBudget(budgetData);
    } catch (error) {
      console.error('Lỗi khi tải danh sách ngân sách:', error);
      setBudgets([]);
      getBudget([]);
    }
  };

  const handleApprove = async (id: string) => {
    setIsLoading(true);
    toast({ title: "Đang xử lý phê duyệt..." });
    try {
      await ApproveBudget(id);
      toast({ title: "Đã phê duyệt yêu cầu ngân sách thành công" });
      fetchBudgets();
      getBudgetPending();
    } catch (e: unknown) {
      const msg = e instanceof AxiosError
        ? translateError(e.response?.data?.detail)
        : "Không thể phê duyệt yêu cầu.";
      toast({ variant: "destructive", title: "Không thể phê duyệt", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsLoading(true);
    toast({ title: "Đang từ chối yêu cầu..." });
    try {
      await RejectBudget(id);
      toast({ title: "Đã từ chối yêu cầu ngân sách" });
      fetchBudgets();
      getBudgetPending();
    } catch (e: unknown) {
      const msg = e instanceof AxiosError
        ? translateError(e.response?.data?.detail)
        : "Có lỗi khi từ chối yêu cầu.";
      toast({ variant: "destructive", title: "Có lỗi xảy ra", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const translateStatus = (status?: string) => {
    switch (status) {
      case 'approved': return <span className="text-green-600 font-medium">Đã duyệt</span>;
      case 'pending': return <span className="text-yellow-600 font-medium">Chờ duyệt</span>;
      case 'rejected': return <span className="text-red-600 font-medium">Từ chối</span>;
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isAdmin ? 'Quản lý ngân sách' : 'Ngân sách của tôi'}</CardTitle>
        <Button disabled={isLoading || isReadOnly} onClick={() => setIsAddModalOpen(true)}>
          {isAdmin ? 'Thêm ngân sách' : 'Yêu cầu ngân sách'}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Số tiền</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Tháng</TableHead>
              {isAdmin && <TableHead>Thành viên</TableHead>}
              {isAdmin && !isReadOnly && <TableHead>Thao tác</TableHead>}
              {isAdmin && <TableHead>Trạng thái</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Yêu cầu đang chờ duyệt (Chỉ cho Admin) */}
            {isAdmin && bugetPending.map((budget, index) => (
              <TableRow key={`pending-${index}`} className="bg-yellow-50/50">
                <TableCell className="font-bold text-yellow-700">{budget.requested_amount}</TableCell>
                <TableCell>{budget.category_name}</TableCell>
                <TableCell>{budget.month}</TableCell>
                <TableCell>{budget.fullname}</TableCell>
                {!isReadOnly && (
                  <TableCell>
                    <div className="flex space-x-2">
                      {budget.status === 'pending' && (
                        <>
                          <Button disabled={isLoading} onClick={() => handleApprove(budget._id)} size="sm" className="bg-green-600 hover:bg-green-700">
                            Duyệt
                          </Button>
                          <Button disabled={isLoading} onClick={() => handleReject(budget._id)} variant="destructive" size="sm">
                            Từ chối
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
                <TableCell>{translateStatus(budget.status)}</TableCell>
              </TableRow>
            ))}

            {/* Danh sách ngân sách chính thức */}
            {budgets.map((budget, index) => (
              <TableRow key={`budget-${index}`}>
                <TableCell className="font-medium">{budget.amount}</TableCell>
                <TableCell>{budget.category_name}</TableCell>
                <TableCell>{budget.month}</TableCell>
                {isAdmin && <TableCell>{budget.fullname}</TableCell>}
                {isAdmin && !isReadOnly && (
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button disabled={isLoading} onClick={() => setEditingBudget(budget)} variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button disabled={isLoading} onClick={() => setDeletingBudget(budget)} variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
                {isAdmin && <TableCell>{translateStatus(budget.status)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <AddBudgetModal
        fetchBudgets={fetchBudgets}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      {editingBudget && (
        <EditBudgetModal
          fetchBudgets={fetchBudgets}
          budget={editingBudget}
          isOpen={!!editingBudget}
          onClose={() => setEditingBudget(null)}
        />
      )}
      {deletingBudget && (
        <DeleteBudgetDialog
          budget={deletingBudget}
          isOpen={!!deletingBudget}
          onClose={() => setDeletingBudget(null)}
          onDelete={() => handleDeleteBudget(deletingBudget._id)}
        />
      )}
    </Card>
  );
};

export default BudgetManagement;