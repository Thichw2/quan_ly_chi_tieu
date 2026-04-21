'use client'

import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function CreateFamilyDialog() {
  const navigate = useNavigate()
  const family_id = localStorage.getItem('family_id')
  
  // Dialog sẽ tự động mở nếu người dùng chưa có ID gia đình (family_id là 'null')
  return (
    <Dialog open={family_id === 'null'} modal>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Yêu cầu thông tin gia đình
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Trước khi tiếp tục, bạn cần thiết lập thông tin gia đình mình. Điều này giúp chúng tôi cá nhân hóa trải nghiệm và quản lý tài chính hộ gia đình của bạn tốt hơn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <p className="text-sm font-medium text-gray-700">
            Việc thiết lập hồ sơ gia đình bao gồm:
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
            <li>Đặt tên cho gia đình (ví dụ: Gia đình họ Nguyễn)</li>
            <li>Thiết lập các danh mục chi tiêu để tổ chức tài chính khoa học hơn</li>
            <li>Kết nối các thành viên để cùng quản lý ngân sách</li>
          </ul>
        </div>

        <DialogFooter className="sm:justify-center pt-4">
          <Button 
            onClick={() => navigate('/create-family')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5"
          >
            Tạo hồ sơ gia đình ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}