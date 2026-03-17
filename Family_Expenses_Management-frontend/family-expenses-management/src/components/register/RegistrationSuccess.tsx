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
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Đăng ký thành công
          </DialogTitle>
          <DialogDescription>
            Tài khoản của bạn đã được tạo thành công. Bạn có thể đăng nhập ngay bây giờ.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleGoToLogin}>Đi đến trang đăng nhập</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

