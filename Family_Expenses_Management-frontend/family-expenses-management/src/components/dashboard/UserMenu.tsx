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
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
             
              <DropdownMenuItem onClick={togglePassword}>
                <Settings />
                <span>Change password</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ChangePasswordDialog isOpen={isOpen} onClose={togglePassword}/>
        
        </>
      )
}

export default UserMenu