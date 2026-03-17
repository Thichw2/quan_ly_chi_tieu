import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2} from 'lucide-react';
import RegistrationDialog from '@/components/setting/RegistrationDialog';
import { getMemberFamily } from '@/service/API';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteMemberDialog } from '@/components/setting/DeleteMember';
import { CategoryManagement } from '@/components/setting/CategoryManagement';

interface Member {
  id: string;
  fullname: string;
  username: string;
  role: string;
  email: string;
  specifcRole: string
}



export default function Settings() {
  const [members, setMembers] = useState<Member[]>([]);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)

  const handleDeleteClick = (member: Member) => {
    setDeletingMember(member)
  }

  const handleDeleteConfirm = () => {
    if (deletingMember) {
      setDeletingMember(null)
    }
  }

  const handleGetFamilyMember = async () => {
    try {
      const data = await getMemberFamily()
      setMembers(data?.data.map((item: Member) => ({
        id: item.id,
        fullname: item.fullname,
        username: item.username,
        role: item.role,
        budget: item.email,
        specifcRole: item.specifcRole
      })));
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(()=> {
    handleGetFamilyMember()
  }, [])



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
            <div className="divide-y">
              {members.length === 0 ? (
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
                  <TableBody >
                    {members.map((member) => (
                      <TableRow key={member.fullname}>
                        <TableCell className="font-medium">{member.fullname}</TableCell>
                        <TableCell>{member.username}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.specifcRole}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(member)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
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