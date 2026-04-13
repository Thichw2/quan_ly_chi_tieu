import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import apiUrl from '@/service/apiUrl'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleReset = async () => {
    if (newPassword !== confirmPassword) {
      return toast({ title: "Lỗi", description: "Mật khẩu không khớp", variant: "destructive" })
    }
    if (!token) return toast({ title: "Lỗi", description: "Token không tìm thấy", variant: "destructive" })

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('token', token)
      params.append('new_password', newPassword)

      await axios.post(`${apiUrl}/auth/reset-password`, params)
      
      toast({ title: "Thành công", description: "Mật khẩu đã được đổi. Vui lòng đăng nhập." })
      navigate('/login')
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.detail || "Link đã hết hạn.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader><CardTitle className='text-white'>Đặt lại mật khẩu</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input 
            type="password" 
            placeholder="Mật khẩu mới" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            className="bg-white/20 text-white"
          />
          <Input 
            type="password" 
            placeholder="Xác nhận mật khẩu" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="bg-white/20 text-white"
          />
          <Button onClick={handleReset} disabled={loading} className="w-full">
            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPassword