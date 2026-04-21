'use client'

import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from '@/hooks/use-toast'
import { Loader2, ShieldCheck, LockKeyhole } from 'lucide-react'
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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    // Kiểm tra dữ liệu đầu vào cơ bản
    if (newPassword.length < 8) {
      return toast({ 
        title: "Mật khẩu yếu", 
        description: "Mật khẩu mới phải có ít nhất 8 ký tự.", 
        variant: "destructive" 
      })
    }

    if (newPassword !== confirmPassword) {
      return toast({ 
        title: "Lỗi xác nhận", 
        description: "Mật khẩu xác nhận không khớp.", 
        variant: "destructive" 
      })
    }

    if (!token) {
      return toast({ 
        title: "Lỗi bảo mật", 
        description: "Mã xác thực (Token) không hợp lệ hoặc đã bị thay đổi.", 
        variant: "destructive" 
      })
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('token', token)
      params.append('new_password', newPassword)

      await axios.post(`${apiUrl}/auth/reset-password`, params)
      
      toast({ 
        title: "Thành công", 
        description: "Mật khẩu đã được thay đổi. Bạn có thể đăng nhập ngay bây giờ." 
      })
      
      // Chờ một lát để người dùng đọc thông báo thành công
      setTimeout(() => {
        navigate('/login')
      }, 1500)
      
    } catch (error: any) {
      toast({
        title: "Lỗi thực thi",
        description: error.response?.data?.detail || "Liên kết này đã hết hạn hoặc không còn hiệu lực.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[url('/bg.png')] bg-cover bg-center min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl transition-all">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="bg-white/20 p-3 rounded-full">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className='text-3xl font-bold text-center text-white tracking-tight'>
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription className="text-center text-blue-100">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white ml-1 flex items-center gap-2">
                <LockKeyhole size={16} /> Mật khẩu mới
              </Label>
              <Input 
                type="password" 
                placeholder="Nhập tối thiểu 8 ký tự" 
                required
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:bg-white/20 transition-all h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white ml-1">Xác nhận mật khẩu mới</Label>
              <Input 
                type="password" 
                placeholder="Nhập lại mật khẩu mới" 
                required
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:bg-white/20 transition-all h-11"
              />
            </div>

            <Button 
              type="submit"
              disabled={loading} 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-lg active:scale-[0.98] transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Cập nhật mật khẩu"
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}

export default ResetPassword;