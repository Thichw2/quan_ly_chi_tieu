import FinancialReport from '@/components/repports/FinancialReport';
import { GetFamilyData, getMemberData, GetMonthlyData } from '@/service/API';
import { useEffect, useState } from 'react';

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
  const [membersData, setMembersData] = useState<MembersData>({ members: {} }); // Sửa lỗi ở đây
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({ monthlyData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overview, members, monthly] = await Promise.all([
          fetchOverviewData(),
          fetchMembersData(),
          fetchMonthlyData(),
        ]);
        setOverviewData(overview);
        setMembersData(members);
        setMonthlyData(monthly); // Truyền toàn bộ đối tượng MonthlyData
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className='h-full max-h-[calc(100vh-64px)] overflow-auto bg-gray-100'>
      <FinancialReport
      overviewData={overviewData!}
      membersData={membersData}
      monthlyData={monthlyData} // Truyền đối tượng MonthlyData trực tiếp
    />
    </div>
  );
};

export default Reports;
