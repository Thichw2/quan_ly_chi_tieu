// contexts/ExpenseContext.tsx
import React, { createContext, useContext } from 'react';

type CategoryType = 'Groceries' | 'Utilities' | 'Entertainment' | 'Transportation' | 'Healthcare' | 'Education';

interface Expense {
  id: string;
  amount: number;
  category: CategoryType;
  description: string;
  date: string;
  memberId: string;
}

interface Member {
  id: string;
  name: string;
  budget: number;
}

interface Budget {
  id: string;
  amount: number;
  category: CategoryType;
  memberId: string;
  month: number;
  year: number;
}

interface ExpenseState {
  expenses: Expense[];
  members: Member[];
  budgets: Budget[];
}

type ExpenseAction = 
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'ADD_MEMBER'; payload: Member }
  | { type: 'UPDATE_MEMBER'; payload: Member }
  | { type: 'DELETE_MEMBER'; payload: string }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'LOAD_DATA'; payload: ExpenseState };



const ExpenseContext = createContext<{
  state: ExpenseState;
  dispatch: React.Dispatch<ExpenseAction>;
} | undefined>(undefined);



export function useExpenseContext() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenseContext must be used within an ExpenseProvider');
  }
  return context;
}