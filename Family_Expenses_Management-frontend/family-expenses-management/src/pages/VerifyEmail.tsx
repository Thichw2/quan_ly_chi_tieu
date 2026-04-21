'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from '@/hooks/use-toast'
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import apiUrl from '@/service/apiUrl'

const VerifyEmail = () => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  
  // Lấy dữ liệu từ state của navigate (được truyền từ trang Register hoặc Login)
  const email = location.state?.email || "Email của bạn"

  // Kiểm tra nếu không có email trong state thì quay lại login (tránh truy cập trái phép)
  useEffect(() => {
    if (!location.state?.email && !location.state?.username) {
      toast({
        title: "Lỗi truy cập",
        description: "Vui lòng đăng ký hoặc đăng nhập lại để xác thực.",
        variant: "destructive"
      })
      navigate('/login')
    }
  }, [location.state, navigate, toast])

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length < 4) {
      return toast({ 
        title: "Mã OTP không hợp lệ", 
        description: "Vui lòng nhập đầy đủ mã xác thực.", 
        variant: "destructive" 
      });
    }

    setLoading(true);
    try {
      // Chuyển sang Form Data để tương thích với Backend
      const params = new URLSearchParams();
      params.append('email', location.state?.email || "");
      params.append('otp', otp);

      await axios.post(`${apiUrl}/auth/verify-email`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      toast({ 
        title: "Xác thực thành công", 
        description: "Tài khoản của bạn đã được kích hoạt. Hãy đăng nhập ngay!" 
      });
      
      navigate('/login', { state: { message: "Email đã được xác thực thành công." } });
    } catch (error: any) {
      toast({
        title: "Lỗi xác thực",
        description: error.response?.data?.detail || "Mã OTP không chính xác hoặc đã hết hạn.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[url('/bg.png')] bg-cover bg-center min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl text-white transition-all">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="bg-green-500/20 p-3 rounded-full">
              <MailCheck className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center tracking-tight">Xác thực Email</CardTitle>
          <CardDescription className="text-center text-blue-100 text-sm">
            Mã OTP đã được gửi đến: <br />
            <span className="font-bold text-white">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2 text-center font-medium">
              <Input 
                placeholder="000000" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                maxLength={10}
                className="bg-white/10 border-white/30 text-white text-center text-3xl tracking-[1rem] h-16 focus:bg-white/20 transition-all placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-400 italic">Nhập mã xác thực gồm các chữ số</p>
            </div>

            <Button 
              type="submit"
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 shadow-lg active:scale-[0.98] transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                "Xác nhận kích hoạt"
              )}
            </Button>
          </form>
        </CardContent>

        <div className="px-6 pb-6 text-center">
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 text-sm text-blue-200 hover:text-white transition-colors w-full"
          >
            <ArrowLeft size={14} /> Quay lại đăng nhập
          </button>
        </div>
      </Card>
    </div>
  )
}

export default VerifyEmail