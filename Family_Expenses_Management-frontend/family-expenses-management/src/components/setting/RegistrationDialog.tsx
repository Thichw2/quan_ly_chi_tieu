'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Mail, UserPlus, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AdminRegisterUser, inviteMemberViaEmail } from '@/service/API'

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
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);
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
      // Reset form
      setNewMember({ username: '', email: '', password: '', confirmPassword: '', fullName: '', role: 'member', specificRole: 'child' });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: e.response?.data?.detail || "Không thể tạo người dùng mới",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await inviteMemberViaEmail(inviteData.email, inviteData.role);
      toast({ 
        title: "Đã gửi lời mời", 
        description: response.data.message || `Một email hướng dẫn đã được gửi tới ${inviteData.email}` 
      });
      setInviteData({ email: '', role: 'member' });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Lỗi gửi lời mời", 
        description: error.response?.data?.detail || "Không thể gửi lời mời lúc này." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <UserPlus size={18} /> Thêm thành viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quản lý thành viên</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="direct" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="direct">Tạo trực tiếp</TabsTrigger>
            <TabsTrigger value="invite">Mời qua Email</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4">
            <form onSubmit={handleAddMemberDirect} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input id="fullName" name="fullName" value={newMember.fullName} onChange={handleInputChange} placeholder="Nguyễn Văn A" required />
                  {errors.fullName && <p className="text-[11px] text-red-500 font-medium">{errors.fullName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" value={newMember.username} onChange={handleInputChange} placeholder="vana_123" required />
                  {errors.username && <p className="text-[11px] text-red-500 font-medium">{errors.username}</p>}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="email">Email liên hệ</Label>
                <Input id="email" name="email" type="email" value={newMember.email} onChange={handleInputChange} placeholder="vana@example.com" required />
                {errors.email && <p className="text-[11px] text-red-500 font-medium">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input id="password" name="password" type="password" value={newMember.password} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={newMember.confirmPassword} onChange={handleInputChange} required />
                  {errors.confirmPassword && <p className="text-[11px] text-red-500 font-medium">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Quyền hệ thống</Label>
                  <Select onValueChange={(v) => setNewMember({...newMember, role: v})} defaultValue={newMember.role}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Quản trị (Admin)</SelectItem>
                      <SelectItem value="member">Người dùng (Member)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
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

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Đang xử lý..." : "Tạo tài khoản thành viên"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <form onSubmit={handleInviteEmail} className="space-y-4 pt-2">
              <Alert className="bg-blue-50 border-blue-200">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs leading-relaxed">
                  Hệ thống sẽ gửi email chứa mã định danh gia đình. Người nhận chỉ cần đăng ký hoặc đăng nhập để tham gia tự động.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email người nhận</Label>
                <Input 
                  id="inviteEmail"
                  placeholder="nhap-email@gmail.com" 
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
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                    <SelectItem value="member">Thành viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" variant="default" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Gửi email mời tham gia"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default RegistrationDialog;