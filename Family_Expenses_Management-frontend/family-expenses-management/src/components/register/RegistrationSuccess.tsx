'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface RegistrationSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function RegistrationSuccessDialog({ isOpen, onClose }: RegistrationSuccessDialogProps) {
  const [open, setOpen] = useState(isOpen)
  const navigate = useNavigate()

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  const handleGoToLogin = () => {
    handleClose()
    navigate('/login')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            Đăng ký thành công!
          </DialogTitle>
          <DialogDescription className="pt-2">
            Tài khoản của bạn đã được tạo thành công trên hệ thống. 
            Giờ đây bạn đã có thể bắt đầu quản lý chi tiêu gia đình.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button 
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700" 
            onClick={handleGoToLogin}
          >
            Đăng nhập ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}