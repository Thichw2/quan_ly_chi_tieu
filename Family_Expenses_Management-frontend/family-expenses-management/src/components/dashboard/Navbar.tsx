'use client'

import { useNavigate, useLocation } from 'react-router-dom' // Import useNavigate và useLocation từ react-router-dom
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

  const getBreadcrumbName = () => {
    switch (location.pathname) {
        case '/':
            return 'Dashboard'
        case '/expenses':
            return 'Expenses'
        case '/budget':
            return 'Budget'
        case '/expenses':
            return 'Expenses'
        case '/reports':
            return 'Report'
        default:
            return 'Settings'
    }
  }

  return (
    <nav className="">
      <div className="flex h-16 items-center px-4">
        <div className="flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" onClick={() => navigate('/')}>Home</BreadcrumbLink> {/* Sử dụng navigate khi click vào Home */}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{getBreadcrumbName()}</BreadcrumbPage> {/* Hiển thị tên breadcrumb tương ứng */}
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
