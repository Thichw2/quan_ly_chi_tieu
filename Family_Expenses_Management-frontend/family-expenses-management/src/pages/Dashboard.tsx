'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Users, AlertTriangle, BadgeDollarSign } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Skeleton } from "@/components/ui/skeleton"
import { GetFamilyData, getMemberData } from '@/service/API'
import { FamilyData } from '@/config/types'
import { useNavigate } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type MemberDataMap = Record<string, FamilyData>;

export default function Dashboard() {
  // Trạng thái cơ bản
  const [familyData, setFamilyData] = useState<FamilyData>({
    totalBudget: 0,
    totalSpent: 0,
    categoryData: [],
    memberData: [],
    recentExpenses: []
  });
  const [memberData, setMemberData] = useState<MemberDataMap>({});
  const [selectedMember, setSelectedMember] = useState<'Family' | keyof MemberDataMap>('Family');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showEmptyDataDialog, setShowEmptyDataDialog] = useState(false);
  
  const navigate = useNavigate();

  // Dữ liệu hiển thị dựa trên thành viên được chọn
  const currentData = useMemo(() => {
    if (selectedMember === 'Family') {
      return familyData;
    }
    return memberData[selectedMember] || familyData;
  }, [selectedMember, familyData, memberData]);

  const totalBudget = currentData.totalBudget;
  const totalSpent = currentData.totalSpent;
  const remainingBudget = totalBudget - totalSpent;
  const categoryData = currentData.categoryData;
  const recentExpenses = currentData.recentExpenses;

  // Thống kê danh mục chi tiêu nhiều nhất
  const topCategoryStats = useMemo(() => {
    if (!categoryData.length) return { name: 'N/A', percentage: '0' };
    
    const totalValue = categoryData.reduce((sum, cat) => sum + cat.value, 0);
    const maxCategory = categoryData.length > 0 
      ? categoryData.reduce((prev, curr) => curr.value > prev.value ? curr : prev)
      : { name: 'N/A', value: 0 };
    
    return {
      name: maxCategory.name,
      percentage: ((maxCategory.value / totalValue) * 100).toFixed(1)
    };
  }, [categoryData]);

  // Chuẩn bị dữ liệu cho biểu đồ cột
  const barChartData = useMemo(() => {
    if (selectedMember === 'Family') {
      return Object.entries(memberData).map(([name, data]) => ({
        name,
        amount: data.totalSpent
      }));
    } else {
      return categoryData.map(category => ({
        name: category.name,
        value: category.value
      }));
    }
  }, [selectedMember, memberData, categoryData]);

  const isDataEmpty = (data: FamilyData): boolean => {
    return (
      data.totalBudget === 0 &&
      data.totalSpent === 0 &&
      data.categoryData.length === 0 &&
      data.memberData.length === 0 &&
      data.recentExpenses.length === 0
    );
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [familyResponse, memberResponse] = await Promise.all([
        GetFamilyData(),
        getMemberData()
      ]);

      const fData = familyResponse.data;
      const mData = memberResponse.data.members;

      if (isDataEmpty(fData)) {
        setShowEmptyDataDialog(true);
      }

      setFamilyData(fData);
      setMemberData(mData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleDialogAction = () => navigate('/settings');
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="h-full max-h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden bg-slate-50">
      <main className="container mx-auto p-4 lg:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển gia đình</h1>
          <Select 
            onValueChange={(value) => setSelectedMember(value as 'Family' | keyof MemberDataMap)} 
            defaultValue="Family"
          >
            <SelectTrigger className="w-[220px] bg-white shadow-sm">
              <SelectValue placeholder="Chọn thành viên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Family">Cả gia đình</SelectItem>
              {Object.keys(memberData).map((memberKey) => (
                <SelectItem value={memberKey} key={memberKey}>
                  {memberKey}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Thẻ thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng đã chi</CardTitle>
              <BadgeDollarSign className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalSpent)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedMember === 'Family' ? 'Tổng chi tiêu cả nhà' : `Chi tiêu của ${selectedMember}`}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ngân sách còn lại</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(remainingBudget)}</div>
                  <Progress
                    value={totalBudget > 0 ? (remainingBudget / totalBudget) * 100 : 0}
                    className="mt-3 h-2"
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chi nhiều nhất</CardTitle>
              <ShoppingCart className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-slate-900">{topCategoryStats.name}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Chiếm {topCategoryStats.percentage}% tổng chi tiêu
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Biểu đồ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Phân bổ chi tiêu</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-72">
                  <Skeleton className="h-60 w-60 rounded-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedMember === 'Family' ? 'So sánh giữa các thành viên' : 'Chi tiết theo danh mục'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar
                      name="Số tiền"
                      dataKey={selectedMember === 'Family' ? 'amount' : 'value'}
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Giao dịch gần đây */}
        <h2 className="text-2xl font-bold mt-10 mb-6">Giao dịch gần đây</h2>
        <div className="grid grid-cols-1 gap-4">
          {recentExpenses?.slice(0, 5).map((transaction) => (
            <Card key={transaction.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full p-3 bg-slate-100 mr-4">
                  <BadgeDollarSign className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900">{transaction.name}</h3>
                  <p className="text-sm text-muted-foreground">{transaction.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{formatCurrency(transaction.amount)}</p>
                  <p className="text-xs text-muted-foreground">{transaction.member}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cảnh báo & Mẹo */}
        {selectedMember === 'Family' && remainingBudget < 0 && (
          <Alert variant="destructive" className="mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cảnh báo ngân sách gia đình</AlertTitle>
            <AlertDescription>
              Gia đình đã chi tiêu vượt quá ngân sách tổng cộng. Vui lòng kiểm tra lại các khoản chi tiêu không thiết yếu.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-8 mb-10">
          <Alert className="bg-indigo-50 border-indigo-100">
            <Users className="h-4 w-4 text-indigo-600" />
            <AlertTitle className="text-indigo-900">Mẹo quản lý chi tiêu</AlertTitle>
            <AlertDescription className="text-indigo-800">
              Hãy tổ chức một buổi họp gia đình nhỏ hàng tháng để thảo luận về mục tiêu ngân sách và chiến lược tiết kiệm cho tháng tới.
            </AlertDescription>
          </Alert>
        </div>
      </main>

      {/* Thông báo dữ liệu trống */}
      <AlertDialog open={showEmptyDataDialog} onOpenChange={setShowEmptyDataDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Không tìm thấy dữ liệu</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng thiết lập thông tin gia đình và danh mục chi tiêu trong trang cài đặt để bắt đầu theo dõi tài chính.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDialogAction} className="bg-indigo-600">
              Đi đến Cài đặt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}