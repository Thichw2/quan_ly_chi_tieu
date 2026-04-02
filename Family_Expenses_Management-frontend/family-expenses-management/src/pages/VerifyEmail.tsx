import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate, useLocation } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import apiUrl from '@/service/apiUrl'

const VerifyEmail = () => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  
  // Lấy dữ liệu từ state của navigate
  const email = location.state?.email
  const username = location.state?.username

  const handleVerify = async () => {
  setLoading(true);
  try {
    // Chuyển sang Form Data
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('otp', otp);

    await axios.post(`${apiUrl}/auth/verify-email`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    toast({ title: "Thành công", description: "Email đã được xác thực." });
    navigate('/login');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md text-white">
        <CardHeader>
          <CardTitle className="text-center">Xác thực Email</CardTitle>
          <p className="text-sm text-center text-gray-300">Vui lòng nhập mã OTP đã gửi đến {email}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Nhập mã OTP" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)}
            className="bg-white/20 text-center text-2xl tracking-widest"
          />
          <Button onClick={handleVerify} disabled={loading} className="w-full">
            {loading ? "Đang xác thực..." : "Xác nhận"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyEmail