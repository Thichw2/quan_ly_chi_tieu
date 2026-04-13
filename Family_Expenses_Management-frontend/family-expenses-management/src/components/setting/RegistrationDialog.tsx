'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AxiosError } from 'axios'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { AlertCircle, Mail, UserPlus } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AdminRegisterUser, inviteMemberViaEmail } from '@/service/API' // Bạn cần thêm hàm InviteUser vào API service nếu chưa có

type FormErrors = {
  [key: string]: string;
}

interface RegistrationDialogProps {
  handleGetFamilyMember: () => void
}

const RegistrationDialog: React.FC<RegistrationDialogProps> = ({
  handleGetFamilyMember
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("direct");

  // State cho tạo trực tiếp
  const [newMember, setNewMember] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'member',
    specificRole: 'child'
  });

  // State cho mời qua email
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member'
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        return value.trim().length < 2 ? 'Tên phải ít nhất 2 ký tự' : '';
      case 'username':
        return !/^[a-zA-Z0-9_]{3,20}$/.test(value) ? 'Username 3-20 ký tự, không chứa ký tự đặc biệt' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email không hợp lệ' : '';
      case 'password':
        return value.length < 8 ? 'Mật khẩu tối thiểu 8 ký tự' : '';
      case 'confirmPassword':
        return value !== newMember.password ? 'Mật khẩu xác nhận không khớp' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleAddMemberDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    Object.entries(newMember).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await AdminRegisterUser(
        newMember.username,
        newMember.email,
        newMember.password,
        newMember.fullName,
        newMember.specificRole,
        newMember.role
      );
      toast({ title: "Thành công", description: "Đã tạo tài khoản và thêm vào gia đình." });
      handleGetFamilyMember();
      setIsDialogOpen(false);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: e.response?.data?.detail || "Không thể tạo user",
      });
    }
  };
const handleInviteEmail = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // Gọi hàm API từ service/API.ts
    const response = await inviteMemberViaEmail(inviteData.email, inviteData.role);
    
    toast({ 
      title: "Thành công", 
      description: response.data.message || `Đã gửi lời mời tới ${inviteData.email}` 
    });
    
    // Reset form và đóng dialog
    setInviteData({ email: '', role: 'member' });
    setIsDialogOpen(false);
  } catch (error: any) {
    toast({ 
      variant: "destructive", 
      title: "Lỗi gửi lời mời", 
      description: error.response?.data?.detail || "Không thể gửi lời mời lúc này." 
    });
  }
};

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus size={18} /> Thêm thành viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Thêm thành viên mới</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="direct" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Tạo trực tiếp</TabsTrigger>
            <TabsTrigger value="invite">Mời qua Email</TabsTrigger>
          </TabsList>

          {/* TAB 1: TẠO TRỰC TIẾP */}
          <TabsContent value="direct">
            <form onSubmit={handleAddMemberDirect} className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Họ và tên</Label>
                  <Input name="fullName" value={newMember.fullName} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1">
                  <Label>Username</Label>
                  <Input name="username" value={newMember.username} onChange={handleInputChange} required />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label>Email</Label>
                <Input name="email" type="email" value={newMember.email} onChange={handleInputChange} required />
                {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Mật khẩu</Label>
                  <Input name="password" type="password" value={newMember.password} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1">
                  <Label>Xác nhận</Label>
                  <Input name="confirmPassword" type="password" value={newMember.confirmPassword} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Vai trò hệ thống</Label>
                  <Select onValueChange={(v) => setNewMember({...newMember, role: v})} defaultValue={newMember.role}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Thành viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Vai trò gia đình</Label>
                  <Select onValueChange={(v) => setNewMember({...newMember, specificRole: v})} defaultValue={newMember.specificRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grandparent">Ông bà</SelectItem>
                      <SelectItem value="parent">Bố mẹ</SelectItem>
                      <SelectItem value="child">Con cái</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full mt-4">Tạo tài khoản</Button>
            </form>
          </TabsContent>

          {/* TAB 2: MỜI QUA EMAIL */}
          <TabsContent value="invite">
            <form onSubmit={handleInviteEmail} className="space-y-4 mt-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Hệ thống sẽ gửi một liên kết tham gia vào email này. Người nhận cần có tài khoản để tham gia.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label>Email người nhận</Label>
                <Input 
                  placeholder="example@gmail.com" 
                  type="email" 
                  required 
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Vai trò dự kiến</Label>
                <Select onValueChange={(v) => setInviteData({...inviteData, role: v})} defaultValue={inviteData.role}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Thành viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" variant="secondary" className="w-full">Gửi lời mời</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default RegistrationDialog