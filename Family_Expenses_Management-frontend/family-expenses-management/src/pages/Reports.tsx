'use client';

import FinancialReport from '@/components/repports/FinancialReport';
import { GetFamilyData, getMemberData, GetMonthlyData } from '@/service/API';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface OverviewData {
  totalBudget: number
  totalSpent: number
  categoryData: Array<{ name: string; value: number }>
  memberData: Array<{ name: string; amount: number }>
  recentExpenses: Array<{
    id: string
    name: string
    amount: number
    category: string
    member: string
  }>
}

interface MemberData {
  totalBudget: number;
  totalSpent: number;
  categoryData: Array<{ name: string; value: number }>;
}

interface MembersData {
  members: {
    [key: string]: MemberData;
  }
}

interface MonthlyData {
  monthlyData: Array<{
    month: string
    expenses: number
    budget: number
    savings: number
  }>
}

// Hàm gọi API tách biệt để code gọn gàng hơn
const fetchOverviewData = async (): Promise<OverviewData> => {
  const response = await GetFamilyData();
  return response.data;
};

const fetchMembersData = async (): Promise<MembersData> => {
  const response = await getMemberData();
  return response.data;
};

const fetchMonthlyData = async (): Promise<MonthlyData> => {
  const response = await GetMonthlyData();
  return response.data;
};

const Reports = () => {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [membersData, setMembersData] = useState<MembersData>({ members: {} });
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({ monthlyData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Sử dụng Promise.all để tải song song cả 3 nguồn dữ liệu, tối ưu thời gian chờ
        const [overview, members, monthly] = await Promise.all([
          fetchOverviewData(),
          fetchMembersData(),
          fetchMonthlyData(),
        ]);
        
        setOverviewData(overview);
        setMembersData(members);
        setMonthlyData(monthly);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu báo cáo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Giao diện loading chuyên nghiệp hơn
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Đang tổng hợp dữ liệu báo cáo...
        </p>
      </div>
    );
  }

  // Trường hợp không có dữ liệu tổng quan
  if (!overviewData) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-muted-foreground italic">
        Không tìm thấy dữ liệu để hiển thị báo cáo.
      </div>
    );
  }

  return (
    <div className="h-full max-h-[calc(100vh-64px)] overflow-auto bg-slate-50/50">
      <div className="container mx-auto py-6">
        <FinancialReport
          overviewData={overviewData}
          membersData={membersData}
          monthlyData={monthlyData}
        />
      </div>
    </div>
  );
};

export default Reports;