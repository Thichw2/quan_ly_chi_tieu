'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

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

interface DeleteBudgetDialogProps {
  budget: Budget;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteBudgetDialog: React.FC<DeleteBudgetDialogProps> = ({ budget, isOpen, onClose, onDelete }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this budget?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the budget for {budget.category_name} 
            with an amount of {budget.amount} for {budget.month}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBudgetDialog;

