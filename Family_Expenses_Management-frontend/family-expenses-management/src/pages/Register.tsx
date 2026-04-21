'use client'

import { useState } from 'react'
import { Eye, EyeOff, UserPlus, Loader2, Mail, User, ShieldCheck, Home } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  
  const [selectedRole, setSelectedRole] = useState('member')
  const [specificRole, setSpecificRole] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const navigate = useNavigate()
  const { toast } = useToast()

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  // Ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số
  const validatePassword = (p: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(p)

  const handleRegister = async () => {
    setLoading(true)
    try {
      await RegisterUser(userName, email, password, name, selectedRole, specificRole);
      
      toast({
        title: "Đăng ký thành công!",
        description: "Mã xác thực (OTP) đã được gửi đến email của bạn.",
      });

      // Chuyển hướng kèm theo dữ liệu để tự động điền ở trang verify
      navigate('/verify-email', { 
        state: { email, username: userName } 
      });
    } catch (e: any) {
      toast({
        title: "Đăng ký thất bại",
        description: e.response?.data?.detail || "Thông tin không hợp lệ hoặc tài khoản đã tồn tại.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (password !== confirmPassword) {
      toast({
        title: "Lỗi mật khẩu",
        description: "Mật khẩu xác nhận không khớp.",
        variant: "destructive"
      })
      return
    }

    if (
      validateEmail(email) && 
      validatePassword(password) && 
      userName && 
      specificRole
    ) {
      handleRegister()
    } else {
      toast({
        title: "Thông tin chưa hợp lệ",
        description: "Vui lòng kiểm tra lại các trường thông tin màu đỏ.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="bg-[url('/bg.png')] w-full bg-cover bg-center min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl text-white transition-all duration-300 hover:bg-white/[0.15]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-extrabold text-center tracking-tight">Tạo Tài Khoản</CardTitle>
          <CardDescription className="text-center text-blue-100 italic">
            Tham gia hệ thống quản lý chi tiêu gia đình
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Họ Tên & Username */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 text-left">
                <Label className="flex items-center gap-2 ml-1"><User size={14}/> Họ và Tên</Label>
                <Input 
                  placeholder="Nguyễn Văn A"
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="bg-white/10 border-white/30 focus:bg-white/20 transition-all placeholder:text-gray-400" 
                />
              </div>
              <div className="space-y-1.5 text-left">
                <Label className="flex items-center gap-2 ml-1"><User size={14}/> Username</Label>
                <Input 
                  placeholder="vana123"
                  required 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  className="bg-white/10 border-white/30 focus:bg-white/20 transition-all placeholder:text-gray-400" 
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 text-left">
              <Label className="flex items-center gap-2 ml-1"><Mail size={14}/> Email</Label>
              <Input 
                placeholder="vana@example.com"
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className={`bg-white/10 border-white/30 focus:bg-white/20 transition-all placeholder:text-gray-400 ${isSubmitting && !validateEmail(email) ? "border-red-400" : ""}`}
              />
              {isSubmitting && !validateEmail(email) && <p className="text-red-400 text-[10px] ml-1">Định dạng email không chính xác</p>}
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 text-left">
                <Label className="ml-1">Mật khẩu</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className={`bg-white/10 border-white/30 focus:bg-white/20 transition-all ${isSubmitting && !validatePassword(password) ? "border-red-400" : ""}`} 
                  />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <Label className="ml-1">Xác nhận</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className={`bg-white/10 border-white/30 focus:bg-white/20 transition-all ${isSubmitting && password !== confirmPassword ? "border-red-400" : ""}`} 
                />
              </div>
            </div>
            {isSubmitting && !validatePassword(password) && (
              <p className="text-red-400 text-[10px] ml-1 text-left italic font-medium">
                Cần 8+ ký tự, 1 chữ Hoa, 1 chữ thường và 1 số.
              </p>
            )}

            {/* Roles */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 text-left">
                <Label className="flex items-center gap-2 ml-1"><ShieldCheck size={14}/> Hệ thống</Label>
                <Select onValueChange={setSelectedRole} defaultValue="member">
                  <SelectTrigger className="bg-white/10 border-white/30 focus:bg-white/20 transition-all">
                    <SelectValue placeholder="Chọn quyền" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Quản trị viên (Admin)</SelectItem>
                    <SelectItem value="member">Thành viên (Member)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 text-left">
                <Label className="flex items-center gap-2 ml-1"><Home size={14}/> Vai trò gia đình</Label>
                <Select onValueChange={setSpecificRole} required>
                  <SelectTrigger className={`bg-white/10 border-white/30 focus:bg-white/20 transition-all ${isSubmitting && !specificRole ? "border-red-400" : ""}`}>
                    <SelectValue placeholder="Bạn là ai?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="father">Ba (Father)</SelectItem>
                    <SelectItem value="mother">Mẹ (Mother)</SelectItem>
                    <SelectItem value="child">Con (Child)</SelectItem>
                    <SelectItem value="other">Thành viên khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button 
              disabled={loading} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 shadow-lg active:scale-[0.98] transition-all" 
              type="submit"
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <UserPlus size={18} className="mr-2" />}
              {loading ? "Đang xử lý..." : "Đăng ký ngay"}
            </Button>
            <p className="text-sm text-center text-gray-200">
              Đã có tài khoản?{" "}
              <button 
                type="button"
                onClick={() => navigate('/login')} 
                className="text-indigo-300 font-bold hover:underline underline-offset-4"
              >
                Đăng nhập
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default RegisterPage