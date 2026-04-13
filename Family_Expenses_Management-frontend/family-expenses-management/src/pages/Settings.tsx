import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from 'lucide-react';
import RegistrationDialog from '@/components/setting/RegistrationDialog';
import { deleteMemberApi, getMemberFamily } from '@/service/API';
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

  // Sử dụng useCallback để hàm không bị khởi tạo lại vô ích
  const handleGetFamilyMember = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getMemberFamily();
      const data = response?.data || response;
      
      // Map dữ liệu cẩn thận, ưu tiên lấy id chuẩn
      const mappedMembers = data.map((item: any) => ({
        id: item.id || item._id, 
        fullname: item.fullname || '',
        username: item.username || '',
        role: item.role || '',
        email: item.email || '',
        specific_role: item.specific_role || ''
      }));
      
      setMembers(mappedMembers);
    } catch (e) {
      console.error("Lỗi lấy danh sách:", e);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách thành viên",
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
        description: `Đã xóa thành viên ${deletingMember.fullname} khỏi gia đình` 
      });
      // Gọi lại danh sách mới
      handleGetFamilyMember(); 
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Lỗi", 
        description: "Bạn không có quyền hoặc không thể xóa thành viên này" 
      });
    } finally {
      setDeletingMember(null);
    }
  };

  useEffect(() => {
    handleGetFamilyMember();
  }, [handleGetFamilyMember]);

  return (
    <div className="h-full max-h-[calc(100vh-64px)] overflow-auto bg-gray-100">
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Cài đặt thành viên gia đình</h1>
          <RegistrationDialog 
            handleGetFamilyMember={handleGetFamilyMember}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách thành viên</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4 text-gray-500">Đang tải dữ liệu...</p>
            ) : members.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có thành viên nào</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò cụ thể</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    // QUAN TRỌNG: Dùng member.id thay vì fullname để làm key
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.fullname}</TableCell>
                      <TableCell>{member.username}</TableCell>
                      <TableCell className="capitalize">{member.role}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.specific_role}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingMember(member)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className='mt-5'>
          <CategoryManagement />
        </div>
      </main>

      <DeleteMemberDialog
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDeleteConfirm}
        memberName={deletingMember?.fullname || ''}
      />
    </div>
  );
}