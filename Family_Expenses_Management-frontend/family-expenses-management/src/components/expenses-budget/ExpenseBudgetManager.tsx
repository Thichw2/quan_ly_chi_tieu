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

interface Budget {
  _id: string;
  amount: string;
  category_name: string;
  month: string;
  user_id?: string;
  fullname?: string;
  category_id: string
  year: string
  status?: 'approved' | 'pending' | 'rejected';
}
interface BudgetRequest {
  _id: string;
  requested_amount: string;
  category_name: string;
  month: string;
  user_id?: string;
  fullname?: string;
  category_id: string
  year: string
  status?: 'approved' | 'pending' | 'rejected';
}

interface BudgetManagementProps{
  getBudget: (budget: Budget[]) => void
}

const BudgetManagement: React.FC<BudgetManagementProps> = ({
  getBudget
}) => {
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [bugetPending, setBudgetPending] = useState<BudgetRequest[]>([])
  const [isLoading ,setIsLoading] = useState<boolean>(false)
  const handleDeleteBudget = async (budgetId: string) => {
    setIsLoading(true)
    try {
      await deleteBudget(budgetId)
      fetchBudgets()
      toast({
        title: "Xóa budget thành công!",
        })
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
          toast({
          variant: "destructive",
          title: "Uh oh! Đã có lỗi xảy ra",
          description: e.response?.data?.detail || "Unknown error",
          });
      } else {
          console.error("An unexpected error occurred:", e);
      }
  }
  setIsLoading(false)
}
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
    fetchBudgets();
    getBudgetPending()
  }, []);

  const getBudgetPending = async () => {
    try {
      const data = await BugetPending()
      setBudgetPending(data.data)
    } catch (e) {
      console.log(e)
    }
  }

  const fetchBudgets = async () => {
    try {
      const data = await getBudgets()
      setBudgets(data.data);
      getBudget(data.data)
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };


  const handleApprove = async (id: string) => {
      setIsLoading(true)
    toast({
      title: "Loading to approve",
      })
    try {
      await ApproveBudget(id);
      toast({
        title: "Đã chấp nhận thành công khoản budget xin thêm",
        })
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
          toast({
          variant: "destructive",
          title: "Uh oh! Đã có lỗi xảy ra",
          description: e.response?.data?.detail || "Unknown error",
          });
      } else {
          console.error("An unexpected error occurred:", e);
      }
      fetchBudgets()
      getBudgetPending()
  }
  setIsLoading(false)
};

  const handleReject = async (id: string) => {
    setIsLoading(true)
    toast({
      title: "Loading to reject",
      })
    try {
      await RejectBudget(id);
      toast({
        title: "Đã Từ chối khoản budget xin thêm",
        })
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
          toast({
          variant: "destructive",
          title: "Uh oh! Đã có lỗi xảy ra",
          description: e.response?.data?.detail || "Unknown error",
          });
      } else {
          console.error("An unexpected error occurred:", e);
      }
    }
    setTimeout(() => {
      fetchBudgets()
      getBudgetPending()
    },3000)
    setIsLoading(false)
  };




  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isAdmin ? 'Budget Management' : 'My Budgets'}</CardTitle>
        <Button disabled={isLoading} onClick={() => setIsAddModalOpen(true)}>
          {isAdmin ? 'Add Budget' : 'Request Budget'}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Month</TableHead>
              {isAdmin && <TableHead>Member</TableHead>}
              {isAdmin && <TableHead>Actions</TableHead>}
              {isAdmin && <TableHead>Status</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            
            {
              isAdmin && bugetPending.map((budget, index) => (
                <TableRow key={index}>
                  <TableCell>{budget.requested_amount}</TableCell>
                  <TableCell>{budget.category_name}</TableCell>
                  <TableCell>{budget.month}</TableCell>
                  {isAdmin && <TableCell>{budget.fullname}</TableCell>}
                  {isAdmin && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {budget.status === 'pending' && (
                          <>
                            <Button disabled={isLoading} onClick={() => handleApprove(budget._id)} size="sm">
                              Approve
                            </Button>
                            <Button disabled={isLoading} onClick={() => handleReject(budget._id)} variant="destructive" size="sm">
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {isAdmin && <TableCell>{budget.status}</TableCell>}

                </TableRow>
              ))
            }
            {budgets.map((budget, index) => (
              <TableRow key={index}>
                <TableCell>{budget.amount}</TableCell>
                <TableCell>{budget.category_name}</TableCell>
                <TableCell>{budget.month}</TableCell>
                {isAdmin && <TableCell>{budget.fullname}</TableCell>}
                {isAdmin && (
                  <TableCell>
                    <div className="flex space-x-2">
                      {budget.status === 'pending' && (
                        <>
                          <Button disabled={isLoading} onClick={() => handleApprove(budget._id)} size="sm">
                            Approve
                          </Button>
                          <Button disabled={isLoading} onClick={() => handleReject(budget._id)} variant="destructive" size="sm">
                            Reject
                          </Button>
                        </>
                      )}
                      <Button disabled={isLoading} onClick={() => setEditingBudget(budget)} variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button disabled={isLoading} onClick={() => setDeletingBudget(budget)} variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
                {isAdmin && <TableCell>{budget.status}</TableCell>}

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
