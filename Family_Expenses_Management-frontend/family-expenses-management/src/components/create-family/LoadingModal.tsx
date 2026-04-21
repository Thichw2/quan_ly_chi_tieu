'use client'

import { CheckCircle2, Loader2, Home, XCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

interface Step {
  label: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

interface LoadingModalProps {
  isOpen: boolean;
  steps: Step[];
}

export function LoadingModal({ isOpen, steps }: LoadingModalProps) {
  const navigate = useNavigate()

  const handleBackHome = () => {
    navigate("/")
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-xl font-bold">
          Đang khởi tạo gia đình mới
        </DialogTitle>
        <div className="space-y-8 py-4">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                {/* Biểu tượng trạng thái Đang xử lý */}
                {step.status === 'loading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                )}
                
                {/* Biểu tượng trạng thái Hoàn thành */}
                {step.status === 'complete' && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}

                {/* Biểu tượng trạng thái Lỗi */}
                {step.status === 'error' && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                
                {/* Biểu tượng trạng thái Chờ xử lý */}
                {step.status === 'pending' && (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}

                <span className={`flex-1 ${
                  step.status === 'loading' ? 'text-blue-500 font-medium' :
                  step.status === 'complete' ? 'text-green-500' :
                  step.status === 'error' ? 'text-red-500 font-medium' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          
          <div className='w-full flex justify-end pt-4'>
            <Button onClick={handleBackHome} className='flex items-center gap-2'>
              Về trang chủ <Home className='w-4 h-4'/>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}