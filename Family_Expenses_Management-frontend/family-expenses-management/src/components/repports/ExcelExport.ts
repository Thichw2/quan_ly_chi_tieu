import { utils, writeFile, WorkBook } from 'xlsx';

interface OverviewData {
  totalBudget: number;
  totalSpent: number;
  categoryData: Array<{ name: string; value: number }>;
  memberData: Array<{ name: string; amount: number }>;
  recentExpenses: Array<{
    id: string;
    name: string;
    amount: number;
    category: string;
    member: string;
  }>;
}

interface MembersData {
  members: {
    [key: string]: {
      totalBudget: number;
      totalSpent: number;
      categoryData: Array<{ name: string; value: number }>;
    };
  };
}

interface MonthlyData {
  monthlyData: Array<{
    month: string;
    expenses: number;
    budget: number;
    savings: number;
  }>;
}

export const exportToExcel = (
  overviewData: OverviewData,
  membersData: MembersData,
  monthlyData: MonthlyData
): void => {
  try {
    const workbook: WorkBook = utils.book_new();

    // Format numbers to 2 decimal places
    const formatNumber = (num: number): number => Number(num.toFixed(2));

    // Monthly Data Sheet with formatted numbers
    const formattedMonthlyData = monthlyData.monthlyData.map(item => ({
      ...item,
      expenses: formatNumber(item.expenses),
      budget: formatNumber(item.budget),
      savings: formatNumber(item.savings)
    }));
    const monthlyWorksheet = utils.json_to_sheet(formattedMonthlyData);
    utils.book_append_sheet(workbook, monthlyWorksheet, 'Monthly Data');

    // Category Data Sheet
    const formattedCategoryData = overviewData.categoryData.map(item => ({
      Category: item.name,
      Amount: formatNumber(item.value)
    }));
    const categoryWorksheet = utils.json_to_sheet(formattedCategoryData);
    utils.book_append_sheet(workbook, categoryWorksheet, 'Category Data');

    // Member Data Sheet
    const formattedMemberData = overviewData.memberData.map(item => ({
      Member: item.name,
      Amount: formatNumber(item.amount)
    }));
    const memberWorksheet = utils.json_to_sheet(formattedMemberData);
    utils.book_append_sheet(workbook, memberWorksheet, 'Member Data');

    // Recent Expenses Sheet
    const formattedExpenses = overviewData.recentExpenses.map(item => ({
      Name: item.name,
      Amount: formatNumber(item.amount),
      Category: item.category,
      Member: item.member
    }));
    const expensesWorksheet = utils.json_to_sheet(formattedExpenses);
    utils.book_append_sheet(workbook, expensesWorksheet, 'Recent Expenses');

    // Members Detail Sheet
    const membersDetailData = Object.entries(membersData.members).flatMap(([member, data]) =>
      data.categoryData.map(category => ({
        Member: member,
        Category: category.name,
        Amount: formatNumber(category.value),
        'Total Budget': formatNumber(data.totalBudget),
        'Total Spent': formatNumber(data.totalSpent),
        'Remaining': formatNumber(data.totalBudget - data.totalSpent),
        'Spend %': formatNumber((data.totalSpent / data.totalBudget) * 100)
      }))
    );
    const membersDetailWorksheet = utils.json_to_sheet(membersDetailData);
    utils.book_append_sheet(workbook, membersDetailWorksheet, 'Members Detail');

    // Summary Sheet
    const summaryData = [
      { Metric: 'Total Budget', Value: formatNumber(overviewData.totalBudget) },
      { Metric: 'Total Spent', Value: formatNumber(overviewData.totalSpent) },
      { 
        Metric: 'Remaining', 
        Value: formatNumber(overviewData.totalBudget - overviewData.totalSpent) 
      },
      { 
        Metric: 'Spend Percentage', 
        Value: formatNumber((overviewData.totalSpent / overviewData.totalBudget) * 100) 
      }
    ];
    const summaryWorksheet = utils.json_to_sheet(summaryData);
    utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Generate Excel file with current timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    writeFile(workbook, `Financial_Report_${timestamp}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export Excel file');
  }
};