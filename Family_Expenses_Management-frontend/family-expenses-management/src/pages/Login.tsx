import { useState, useEffect } from 'react'
import { Eye, EyeOff, LogIn, Mail, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Login, ForgotPassword } from '@/service/API'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { useLocation } from 'react-router-dom';
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('') // FastAPI dùng username
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Thêm useEffect để bắt thông báo từ trang khác chuyển về
  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: "Thông báo",
        description: location.state.message,
      });
      // Xóa state để tránh hiện lại khi F5
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);
 const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await Login(username, password)
      
      // 1. LẤY DỮ LIỆU ĐÚNG CẤU TRÚC
      const { access_token, user } = response.data 

      // 2. LƯU TOKEN VÀ THÔNG TIN USER
      localStorage.setItem("access_token", access_token)
      
      if (user) {
        // Lưu _id (Backend trả về _id chứ không phải user_id)
        localStorage.setItem("user_id", user._id)
        
        // Lưu family_id (Nếu có)
        if (user.family_id) {
          localStorage.setItem("family_id", user.family_id)
        } else {
          localStorage.removeItem("family_id") // Đảm bảo sạch dữ liệu cũ
        }

        // Lưu quyền Admin
        localStorage.setItem("isAdmin", user.role === "admin" ? "true" : "false")
      }

      toast({
        title: "Đăng nhập thành công",
        description: "Đang chuyển hướng...",
      })

      // 3. ĐIỀU HƯỚNG DỰA TRÊN USER.FAMILY_ID
      // Quan trọng: Phải kiểm tra user.family_id thay vì biến family_id ở ngoài
      setTimeout(() => {
        if (!user.family_id) {
          navigate('/create-family')
        } else {
          navigate('/')
        }
      }, 500)

    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error)
      
      // Nếu Backend báo chưa xác thực email (Ví dụ mã lỗi 403)
      if (error.response?.status === 403) {
        toast({
          title: "Tài khoản chưa xác thực",
          description: "Bạn cần nhập mã OTP gửi tới email trước khi đăng nhập.",
          variant: "destructive",
        })
        // Tự động chuyển sang trang verify nếu chưa xác thực
        navigate('/verify-email', { state: { username: username } })
        return
      }

      toast({
        title: "Lỗi đăng nhập",
        description: error.response?.data?.detail || "Sai tài khoản hoặc mật khẩu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setForgotLoading(true)
    try {
      await ForgotPassword(forgotEmail)
      toast({
        title: "Đã gửi email",
        description: "Vui lòng kiểm tra hộp thư để khôi phục mật khẩu.",
      })
      setForgotEmail('')
    } catch (e) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi email khôi phục.",
        variant: "destructive",
      })
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="bg-[url('/bg.png')] w-full bg-cover bg-center min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">Đăng Nhập</CardTitle>
          <CardDescription className="text-center text-gray-200">
            Quản lý chi tiêu gia đình hiệu quả hơn
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Tên đăng nhập</Label>
              <Input 
                id="username" 
                placeholder="username" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/20 text-white placeholder-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/20 text-white"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700" type="submit">
              {loading ? <Loader2 className="animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              Đăng nhập
            </Button>
            <div className='flex items-center w-full justify-between text-sm'>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-blue-200 p-0">Quên mật khẩu?</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Khôi phục mật khẩu</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Nhập email của bạn"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                    <Button onClick={handleForgotPassword} disabled={forgotLoading} className="w-full">
                      {forgotLoading ? <Loader2 className="animate-spin" /> : "Gửi link khôi phục"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={() => navigate('/register')} variant="link" className="text-blue-200 p-0">
                Đăng ký tài khoản
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage