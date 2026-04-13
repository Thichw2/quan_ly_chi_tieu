import { useState, useEffect } from 'react'
import { Eye, EyeOff, LogIn, Mail, Loader2 } from 'lucide-react'
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

      toast({ title: "Thành công", description: "Đang đăng nhập..." })

      setTimeout(() => {
        if (!user?.family_id) navigate('/create-family')
        else navigate('/')
      }, 600)

    } catch (error: any) {
      const status = error.response?.status
      const detail = error.response?.data?.detail || "Lỗi kết nối server"

      if (status === 403) {
        toast({ title: "Chưa xác thực", description: "Vui lòng nhập OTP từ email.", variant: "destructive" })
        navigate('/verify-email', { state: { username } })
      } else if (status === 401) {
        toast({ title: "Thất bại", description: "Tài khoản hoặc mật khẩu không đúng.", variant: "destructive" })
      } else {
        toast({ title: "Lỗi", description: detail, variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail) return toast({ title: "Lỗi", description: "Nhập email trước!", variant: "destructive" });
    setForgotLoading(true)
    try {
      const res = await ForgotPassword(forgotEmail)
      toast({ title: "Thành công", description: res.data.message })
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.response?.data?.detail || "Gửi thất bại", variant: "destructive" })
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="bg-[url('/bg.png')] w-full bg-cover bg-center min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-white">Đăng Nhập</CardTitle>
          <CardDescription className="text-center text-blue-100">Quản lý chi tiêu gia đình</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Tên đăng nhập</Label>
              <Input 
                placeholder="Username" required value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/10 border-white/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Mật khẩu</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/30 text-white"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700" type="submit">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="mr-2 h-5 w-5" />}
              Xác nhận
            </Button>
            <div className='flex justify-between w-full text-sm'>
              <Dialog>
                <DialogTrigger asChild><Button variant="link" className="text-blue-200 p-0">Quên mật khẩu?</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Khôi phục mật khẩu</DialogTitle></DialogHeader>
                  <Input placeholder="Email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="my-4" />
                  <Button onClick={handleForgotPassword} disabled={forgotLoading} className="w-full">
                    {forgotLoading ? <Loader2 className="animate-spin" /> : "Gửi link"}
                  </Button>
                </DialogContent>
              </Dialog>
              <Button onClick={() => navigate('/register')} variant="link" className="text-blue-200 p-0">Đăng ký</Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage