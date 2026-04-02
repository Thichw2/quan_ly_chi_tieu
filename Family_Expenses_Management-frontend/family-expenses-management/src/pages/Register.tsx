import { useState, useEffect } from 'react'
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RegistrationSuccessDialog } from '@/components/register/RegistrationSuccess'
import { RegisterUser } from '@/service/API'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  
  const navigate = useNavigate()
  const { toast } = useToast()

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  const validatePassword = (p: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(p)

 // Trong RegisterPage.tsx, sửa hàm handleRegister:

 const handleRegister = async () => {
    setLoading(true)
  try {
    const res = await RegisterUser(userName, email, password, name, selectedRole);
    
    toast({
      title: "Đăng ký thành công",
      description: "Mã OTP đã được gửi. Vui lòng kiểm tra email của bạn.",
    });

    // Truyền cả email và username sang trang verify
    navigate('/verify-email', { 
      state: { 
        email: email,
        username: userName // Thêm cái này
      } 
    });
  }
     catch (e: any) {
      console.error("LỖI ĐĂNG KÝ:", e);
      toast({
        title: "Lỗi",
        description: e.response?.data?.detail || "Không thể gửi mail xác nhận. Vui lòng kiểm tra lại cấu hình mail server.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (validateEmail(email) && validatePassword(password) && password === confirmPassword && userName && selectedRole) {
      handleRegister()
    }
  }

  return (
    <div className="bg-[url('/bg.png')] w-full bg-cover bg-center min-h-screen flex items-center justify-center bg-slate-900">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-2xl text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center text-slate-300">Đăng ký thành viên gia đình</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Họ và Tên</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} className="bg-white/20" />
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/20" />
              {isSubmitting && !validateEmail(email) && <p className="text-red-400 text-xs">Email không hợp lệ</p>}
            </div>

            <div className="space-y-1">
              <Label>Tên đăng nhập</Label>
              <Input required value={userName} onChange={(e) => setUserName(e.target.value)} className="bg-white/20" />
            </div>

            <div className="space-y-1">
              <Label>Mật khẩu</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/20" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {isSubmitting && !validatePassword(password) && <p className="text-red-400 text-xs">Mật khẩu cần 8 ký tự, có Hoa, thường và Số</p>}
            </div>

            <div className="space-y-1">
              <Label>Xác nhận mật khẩu</Label>
              <Input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white/20" />
              {isSubmitting && password !== confirmPassword && <p className="text-red-400 text-xs">Mật khẩu không khớp</p>}
            </div>

            <div className="space-y-1">
              <Label>Vai trò</Label>
              <Select onValueChange={setSelectedRole} required>
                <SelectTrigger className="bg-white/20 border-white/30"><SelectValue placeholder="Bạn là ai?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="father">Ba (Father)</SelectItem>
                  <SelectItem value="mother">Mẹ (Mother)</SelectItem>
                  <SelectItem value="child">Con (Child)</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700" type="submit">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus size={18} className="mr-2" />}
              Đăng ký
            </Button>
            <p className="text-sm text-center">
              Đã có tài khoản? <Button variant="link" onClick={() => navigate('/login')} className="text-indigo-300 p-0 h-auto">Đăng nhập</Button>
            </p>
          </CardFooter>
        </form>
      </Card>
      <RegistrationSuccessDialog isOpen={showDialog} onClose={() => navigate('/login')} />
    </div>
  )
}

export default RegisterPage