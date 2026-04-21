'use client';

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

    // Định dạng số về 2 chữ số thập phân
    const formatNumber = (num: number): number => Number(num.toFixed(2));

    // 1. Trang tính Dữ liệu theo tháng
    const formattedMonthlyData = monthlyData.monthlyData.map(item => ({
      'Tháng': item.month,
      'Chi tiêu': formatNumber(item.expenses),
      'Ngân sách': formatNumber(item.budget),
      'Tiết kiệm': formatNumber(item.savings)
    }));
    const monthlyWorksheet = utils.json_to_sheet(formattedMonthlyData);
    utils.book_append_sheet(workbook, monthlyWorksheet, 'Dữ liệu hàng tháng');

    // 2. Trang tính Dữ liệu theo danh mục
    const formattedCategoryData = overviewData.categoryData.map(item => ({
      'Danh mục': item.name,
      'Số tiền': formatNumber(item.value)
    }));
    const categoryWorksheet = utils.json_to_sheet(formattedCategoryData);
    utils.book_append_sheet(workbook, categoryWorksheet, 'Dữ liệu danh mục');

    // 3. Trang tính Dữ liệu thành viên
    const formattedMemberData = overviewData.memberData.map(item => ({
      'Thành viên': item.name,
      'Tổng chi tiêu': formatNumber(item.amount)
    }));
    const memberWorksheet = utils.json_to_sheet(formattedMemberData);
    utils.book_append_sheet(workbook, memberWorksheet, 'Dữ liệu thành viên');

    // 4. Trang tính Chi tiêu gần đây
    const formattedExpenses = overviewData.recentExpenses.map(item => ({
      'Tên khoản chi': item.name,
      'Số tiền': formatNumber(item.amount),
      'Danh mục': item.category,
      'Người chi': item.member
    }));
    const expensesWorksheet = utils.json_to_sheet(formattedExpenses);
    utils.book_append_sheet(workbook, expensesWorksheet, 'Chi tiêu gần đây');

    // 5. Trang tính Chi tiết thành viên
    const membersDetailData = Object.entries(membersData.members).flatMap(([member, data]) =>
      data.categoryData.map(category => ({
        'Thành viên': member,
        'Danh mục': category.name,
        'Số tiền chi lẻ': formatNumber(category.value),
        'Tổng ngân sách': formatNumber(data.totalBudget),
        'Tổng đã chi': formatNumber(data.totalSpent),
        'Còn lại': formatNumber(data.totalBudget - data.totalSpent),
        '% Đã dùng': formatNumber((data.totalSpent / data.totalBudget) * 100)
      }))
    );
    const membersDetailWorksheet = utils.json_to_sheet(membersDetailData);
    utils.book_append_sheet(workbook, membersDetailWorksheet, 'Chi tiết thành viên');

    // 6. Trang tính Tổng hợp (Summary)
    const summaryData = [
      { 'Chỉ số': 'Tổng ngân sách', 'Giá trị': formatNumber(overviewData.totalBudget) },
      { 'Chỉ số': 'Tổng đã chi', 'Giá trị': formatNumber(overviewData.totalSpent) },
      { 
        'Chỉ số': 'Còn lại', 
        'Giá trị': formatNumber(overviewData.totalBudget - overviewData.totalSpent) 
      },
      { 
        'Chỉ số': 'Tỷ lệ chi tiêu (%)', 
        'Giá trị': formatNumber((overviewData.totalSpent / overviewData.totalBudget) * 100) 
      }
    ];
    const summaryWorksheet = utils.json_to_sheet(summaryData);
    utils.book_append_sheet(workbook, summaryWorksheet, 'Tổng hợp chung');

    // Xuất file Excel với dấu thời gian hiện tại
    const timestamp = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    writeFile(workbook, `Bao_cao_tai_chinh_${timestamp}.xlsx`);
    
  } catch (error) {
    console.error('Lỗi khi xuất file Excel:', error);
    throw new Error('Không thể xuất file Excel');
  }
};