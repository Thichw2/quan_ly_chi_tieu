'use client'

import { useNavigate, useLocation } from 'react-router-dom'
import UserMenu from './UserMenu'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const Navbar = () => {
  const navigate = useNavigate() 
  const location = useLocation() 

  // Hàm chuyển đổi đường dẫn sang tên hiển thị tiếng Việt
  const getBreadcrumbName = () => {
    switch (location.pathname) {
      case '/':
        return 'Tổng quan'
      case '/expenses':
        return 'Chi tiêu'
      case '/budget':
        return 'Ngân sách'
      case '/reports':
        return 'Báo cáo'
      case '/family':
        return 'Quản lý gia đình'
      default:
        return 'Trang chủ'
    }
  }

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                {/* Chuyển Home thành Trang chủ */}
                <BreadcrumbLink 
                  href="/" 
                  onClick={(e) => {
                    e.preventDefault(); // Ngăn chặn load lại trang
                    navigate('/');
                  }}
                >
                  Trang chủ
                </BreadcrumbLink>
              </BreadcrumbItem>
              
              <BreadcrumbSeparator />
              
              <BreadcrumbItem>
                <BreadcrumbPage>{getBreadcrumbName()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center space-x-4">
          <UserMenu />
        </div>
      </div>
    </nav>
  )
}

export default Navbar