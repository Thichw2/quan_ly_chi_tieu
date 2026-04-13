'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, ShoppingCart, Users, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Skeleton } from "@/components/ui/skeleton"
import { GetFamilyData, getMemberData } from '@/service/API'
import { FamilyData } from '@/config/types'
import { useNavigate } from 'react-router-dom'
import { EuroIcon } from 'lucide-react'
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
  // Base states
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
  
  // Derived states using the current view data
  const currentData = useMemo(() => {
    if (selectedMember === 'Family') {
      return familyData;
    }
    return memberData[selectedMember] || familyData;
  }, [selectedMember, familyData, memberData]);

  // Computed values from current data
  const totalBudget = currentData.totalBudget;
  const totalSpent = currentData.totalSpent;
  const remainingBudget = totalBudget - totalSpent;
  const categoryData = currentData.categoryData;
  const recentExpenses = currentData.recentExpenses;

  // Calculate top category stats
  const topCategoryStats = useMemo(() => {
    if (!categoryData.length) return { name: 'N/A', percentage: '0' };
    
    const totalValue = categoryData.reduce((sum, cat) => sum + cat.value, 0);
    const maxCategory = categoryData.reduce((prev, curr) => 
      curr.value > prev.value ? curr : prev
    );
    
    return {
      name: maxCategory.name,
      percentage: ((maxCategory.value / totalValue) * 100).toFixed(2)
    };
  }, [categoryData]);

  // Bar chart data preparation
  const barChartData = useMemo(() => {
    if (selectedMember === 'Family') {
      // Transform member data for comparison
      return Object.entries(memberData).map(([name, data]) => ({
        name,
        amount: data.totalSpent
      }));
    } else {
      // Use category data for breakdown
      return categoryData.map(category => ({
        name: category.name,
        value: category.value
      }));
    }
  }, [selectedMember, memberData, categoryData]);
 // Utility functions
  const isDataEmpty = (data: FamilyData): boolean => {
    return (
      data.totalBudget === 0 &&
      data.totalSpent === 0 &&
      data.categoryData.length === 0 &&
      data.memberData.length === 0 &&
      data.recentExpenses.length === 0
    );
  };

  // Data fetching
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [familyResponse, memberResponse] = await Promise.all([
        GetFamilyData(),
        getMemberData()
      ]);

      const familyData = familyResponse.data;
      const memberData = memberResponse.data.members;

      if (isDataEmpty(familyData)) {
        setShowEmptyDataDialog(true);
      }

      setFamilyData(familyData);
      setMemberData(memberData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Consider adding error state and UI handling
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

 
  const navigate = useNavigate();
  const handleDialogAction = () => navigate('/settings');
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="h-full max-h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden bg-gray-100">
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Family Budget Dashboard</h1>
          <Select 
            onValueChange={(value) => setSelectedMember(value as 'Family' | keyof MemberDataMap)} 
            defaultValue="Family"
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Family">Entire Family</SelectItem>
              {Object.keys(memberData).map((memberKey) => (
                <SelectItem value={memberKey} key={memberKey}>
                  {memberKey}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Spent Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedMember === 'Family' ? 'Family total' : `${selectedMember}'s spending`}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Budget Remaining Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Remaining</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">${remainingBudget.toFixed(2)}</div>
                  <Progress
                    value={(remainingBudget / totalBudget) * 100}
                    className="mt-2"
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Top Category Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{topCategoryStats.name}</div>
                  <p className="text-xs text-muted-foreground">
                    {topCategoryStats.percentage}% of total expenses
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-72">
                  <Skeleton className="h-64 w-64 rounded-full" />
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
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedMember === 'Family' ? 'Member Comparison' : 'Category Breakdown'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey={selectedMember === 'Family' ? 'amount' : 'value'}
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <h2 className="text-xl font-semibold mt-8 mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {recentExpenses?.slice(0, 5).map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="flex items-center p-4">
                <div className="rounded-full p-2 bg-gray-100 mr-4">
                  <EuroIcon className='w-4 h-4'/>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold">{transaction.name}</h3>
                  <p className="text-sm text-muted-foreground">{transaction.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{transaction.member}</p>
                </div>
              </CardContent>
            </Card>
          ))}

        </div>

        {/* Alerts */}
        {selectedMember === 'Family' && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Family Budget Alert</AlertTitle>
            <AlertDescription>
              The family has exceeded the Entertainment budget by $100. Consider adjusting spending in this category.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-8 space-y-4">
          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>Family Budgeting Tip</AlertTitle>
            <AlertDescription>
              Consider having a family meeting to discuss budget goals and strategies for the upcoming month.
            </AlertDescription>
          </Alert>
        </div>
      </main>

      {/* Empty Data Dialog */}
      <AlertDialog open={showEmptyDataDialog} onOpenChange={setShowEmptyDataDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No Data Found</AlertDialogTitle>
            <AlertDialogDescription>
              Please set up your family information in the settings page to get started.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDialogAction}>
              Go to Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}