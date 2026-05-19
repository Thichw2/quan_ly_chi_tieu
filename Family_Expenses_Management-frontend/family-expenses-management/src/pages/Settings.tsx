'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, Users, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import RegistrationDialog from '@/components/setting/RegistrationDialog';
import { deleteMemberApi, getMemberFamily } from '@/service/API';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteMemberDialog } from '@/components/setting/DeleteMember';
import { CategoryManagement } from '@/components/setting/CategoryManagement';
import { toast } from '@/hooks/use-toast';

interface Member {
  id: string;
  fullname: string;
  username: string;
  role: string;
  email: string;
  specific_role: string;
}

export default function Settings() {
  const [members, setMembers] = useState<Member[]>([]);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const familyId = localStorage.getItem("family_id");

  // Sử dụng useCallback để tránh re-render hàm không cần thiết
  const handleGetFamilyMember = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getMemberFamily();
      const data = response?.data || response;

      // Xử lý dữ liệu mảng an toàn
      const mappedMembers = Array.isArray(data) ? data.map((item: any) => ({
        id: item.id || item._id,
        fullname: item.fullname || 'Chưa đặt tên',
        username: item.username || '',
        role: item.role || 'member',
        email: item.email || '',
        specific_role: item.specific_role || 'Thành viên'
      })) : [];

      setMembers(mappedMembers);
    } catch (e) {
      console.error("Lỗi lấy danh sách:", e);
      toast({
        variant: "destructive",
        title: "Lỗi hệ thống",
        description: "Không thể tải danh sách thành viên gia đình.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingMember) return;

    try {
      await deleteMemberApi(deletingMember.id);
      toast({
        title: "Thành công",
        description: `Đã xóa thành viên ${deletingMember.fullname} khỏi gia đình.`
      });
      handleGetFamilyMember(); // Cập nhật lại danh sách
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi thực thi",
        description: "Bạn không có quyền hoặc gặp lỗi khi xóa thành viên này."
      });
    } finally {
      setDeletingMember(null);
    }
  };

  useEffect(() => {
    if (familyId && familyId !== 'null') {
      handleGetFamilyMember();
    }
  }, [handleGetFamilyMember, familyId]);

  if (!familyId || familyId === 'null') {
    return (
      <div className="h-full max-h-[calc(100vh-64px)] overflow-auto bg-slate-50/50 flex flex-col items-center justify-center space-y-4 p-8">
        <Users className="w-16 h-16 text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-700">Bạn chưa thiết lập gia đình</h2>
        <p className="text-muted-foreground text-center max-w-md">Vui lòng tạo một gia đình để bắt đầu quản lý tài chính, thêm thành viên và theo dõi các khoản chi tiêu.</p>
        <Button onClick={() => navigate('/create-family')} size="lg" className="mt-4 bg-indigo-600 hover:bg-indigo-700">
          Tạo gia đình mới
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full max-h-[calc(100vh-64px)] overflow-auto bg-slate-50/50">
      <main className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <SettingsIcon className="w-8 h-8 text-slate-700" />
              Thiết lập gia đình
            </h1>
            <p className="text-muted-foreground">Quản lý thành viên và danh mục chi tiêu của bạn</p>
          </div>
          <RegistrationDialog handleGetFamilyMember={handleGetFamilyMember} />
        </div>

        {/* Members Management Card */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <CardTitle>Thành viên trong nhà</CardTitle>
            </div>
            <CardDescription>Danh sách những người cùng tham gia quản lý tài chính</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-20 text-slate-400 italic">
                Chưa có thành viên nào tham gia
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-semibold">Họ tên</TableHead>
                      <TableHead className="font-semibold">Tên đăng nhập</TableHead>
                      <TableHead className="font-semibold text-center">Vai trò</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Quan hệ</TableHead>
                      <TableHead className="text-right font-semibold">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-semibold text-slate-700" >{member.fullname}</TableCell>
                        <TableCell className="text-slate-500">{member.username}</TableCell>
                        <TableCell className="text-center">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                            {member.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500">{member.email}</TableCell>
                        <TableCell>
                          <span className="text-sm font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md capitalize">
                            {member.specific_role}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => setDeletingMember(member)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Management Section */}
        <div className="pt-4">
          <CategoryManagement />
        </div>
      </main>

      {/* Dialog xác nhận xóa */}
      <DeleteMemberDialog
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDeleteConfirm}
        memberName={deletingMember?.fullname || ''}
      />
    </div>
  );
}