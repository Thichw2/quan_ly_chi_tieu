'use client'

import {
    LogOut,
    Settings,
} from "lucide-react"
import ChangePasswordDialog from "../ChangePassword"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Logout } from "@/service/API"
import { useNavigate } from "react-router-dom"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { useState } from "react"

const UserMenu = () => {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const togglePassword = () => {
        setIsOpen(!isOpen)
    }

    const handleLogout = async () => {
        Logout()
        navigate('/login')
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    {/* Việt hóa tiêu đề Menu */}
                    <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {/* Việt hóa mục Đổi mật khẩu */}
                        <DropdownMenuItem onClick={togglePassword} className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Đổi mật khẩu</span>
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    {/* Việt hóa mục Đăng xuất */}
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Component Dialog đổi mật khẩu */}
            <ChangePasswordDialog isOpen={isOpen} onClose={togglePassword}/>
        </>
    )
}

export default UserMenu