'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, LogIn, Mail, Loader2, User, KeyRound } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Login, ForgotPassword } from '@/service/API'
import { useNavigate, useLocation } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.message) {
      toast({ title: "Thông báo", description: location.state.message });
      // Xóa state để tránh hiển thị lại khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await Login(username, password)
      const { access_token, user } = response.data 

      localStorage.setItem("access_token", access_token)
      if (user) {
        localStorage.setItem("user_id", user._id)
        localStorage.setItem("isAdmin", user.role === "admin" ? "true" : "false")
        if (user.family_id) localStorage.setItem("family_id", user.family_id)
      }

      toast({ title: "Đăng nhập thành công", description: "Chào mừng bạn quay trở lại!" })

      // Chờ một chút để người dùng kịp đọc thông báo
      setTimeout(() => {
        if (!user?.family_id) navigate('/create-family')
        else navigate('/')
      }, 800)

    } catch (error: any) {
      const status = error.response?.status
      const detail = error.response?.data?.detail || "Không thể kết nối đến máy chủ"

      if (status === 403) {
        toast({ title: "Yêu cầu xác thực", description: "Vui lòng nhập mã OTP đã được gửi đến email.", variant: "destructive" })
        navigate('/verify-email', { state: { username } })
      } else if (status === 401) {
        toast({ title: "Đăng nhập thất bại", description: "Tên đăng nhập hoặc mật khẩu không chính xác.", variant: "destructive" })
      } else {
        toast({ title: "Lỗi hệ thống", description: detail, variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail) return toast({ title: "Thông báo", description: "Vui lòng nhập Email để nhận liên kết khôi phục.", variant: "destructive" });
    setForgotLoading(true)
    try {
      const res = await ForgotPassword(forgotEmail)
      toast({ title: "Đã gửi yêu cầu", description: res.data.message || "Kiểm tra hộp thư đến của bạn." })
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.response?.data?.detail || "Gửi yêu cầu thất bại", variant: "destructive" })
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="bg-[url('/bg.png')] w-full bg-cover bg-center min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl transition-all duration-300 hover:bg-white/[0.15]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-4xl font-extrabold text-center text-white tracking-tight">Đăng Nhập</CardTitle>
          <CardDescription className="text-center text-blue-100 text-base">
            Quản lý chi tiêu gia đình thông minh
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5">
            <div className="space-y-2 text-left">
              <Label className="text-white ml-1 flex items-center gap-2">
                <User size={16} /> Tên đăng nhập
              </Label>
              <Input 
                placeholder="Nhập username của bạn" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:bg-white/20 transition-all h-11"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label className="text-white ml-1 flex items-center gap-2">
                <KeyRound size={16} /> Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:bg-white/20 transition-all h-11"
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-5 pt-2">
            <Button 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 transition-all shadow-lg active:scale-[0.98]" 
              type="submit"
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
            
            <div className='flex justify-between w-full items-center px-1'>
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="text-blue-100 hover:text-white text-sm transition-colors underline-offset-4 hover:underline font-medium">
                    Quên mật khẩu?
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" /> Khôi phục mật khẩu
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-500 italic">
                      Nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu mới.
                    </p>
                    <Input 
                      placeholder="Email@example.com" 
                      type="email"
                      value={forgotEmail} 
                      onChange={(e) => setForgotEmail(e.target.value)} 
                    />
                  </div>
                  <Button 
                    onClick={handleForgotPassword} 
                    disabled={forgotLoading} 
                    className="w-full bg-blue-600"
                  >
                    {forgotLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Gửi liên kết khôi phục"}
                  </Button>
                </DialogContent>
              </Dialog>
              
              <button 
                type="button"
                onClick={() => navigate('/register')} 
                className="text-blue-100 hover:text-white text-sm transition-colors underline-offset-4 hover:underline font-bold"
              >
                Tạo tài khoản mới
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage