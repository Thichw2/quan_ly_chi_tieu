export type CategoryData = {
    name: string;
    value: number;
  }

export type MemberData = {
    name: string;
    amount: number;
  }

export type Expenses = {
    id: number;
    name: string;
    amount: number;
    category: string;
    icon: React.ElementType;
    member: string;
  }
  
export type FamilyData = {
    totalBudget: number;
    totalSpent: number;
    categoryData: CategoryData[];
    memberData: MemberData[];
    recentExpenses: Expenses[];
  }

export type MemberBudgetData = {
    totalBudget: number;
    totalSpent: number;
    categoryData: CategoryData[];
    recentExpensess: Expenses[];
  }

export type MemberDataMap = {
    [key: string]: MemberBudgetData;
  }