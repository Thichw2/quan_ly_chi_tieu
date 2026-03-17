
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AxiosError } from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AdminRegisterUser } from '@/service/API'


type FormErrors = {
  [key: string]: string;
}

interface RegistrationDialogProps {
  handleGetFamilyMember: () => void
}

const RegistrationDialog: React.FC<RegistrationDialogProps> = ({
  handleGetFamilyMember
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast()
  const [newMember, setNewMember] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: '',
    specificRole: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        return value.trim().length < 2 ? 'Full name must be at least 2 characters long' : '';
      case 'username':
        return !/^[a-zA-Z0-9_]{3,20}$/.test(value) ? 'Username must be 3-20 characters and can only contain letters, numbers, and underscores' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email address' : '';
      case 'password':
        return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value) ? 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' : '';
      case 'confirmPassword':
        return value !== newMember.password ? 'Passwords do not match' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewMember(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: FormErrors = {};
    Object.entries(newMember).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await AdminRegisterUser(
        newMember.username,
        newMember.email,
        newMember.password,
        newMember.fullName,
        newMember.specificRole,
        newMember.role
      )
      toast({
          title: "Đăng ký tài khoản mới thành công!",
          description: "Bạn có thể thêm budget cho tài khoản này ở mục Budget",
        })
        handleGetFamilyMember()
      
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        console.log(e);
        toast({
          variant: "destructive",
          title: "Uh oh! Đã có lỗi xảy ra",
          description: e.response?.data?.detail || "Unknown error",
        });
      } else {
        console.error("An unexpected error occurred:", e);
      }
    }
    
    setNewMember({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: '',
      specificRole: ''
    })
    setIsDialogOpen(false)
    setErrors({})
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
          <Button>Thêm thành viên</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Family Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={newMember.fullName}
                onChange={handleInputChange}
                required
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={newMember.username}
                onChange={handleInputChange}
                required
              />
              {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newMember.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={newMember.password}
                onChange={handleInputChange}
                required
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={newMember.confirmPassword}
                onChange={handleInputChange}
                required
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) => handleSelectChange('role', value)}
                value={newMember.role}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specificRole">Specific Role</Label>
              <Select
                onValueChange={(value) => handleSelectChange('specificRole', value)}
                value={newMember.specificRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a specific role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grandparent">Grandparent</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}
            <Button type="submit">Add Member</Button>
          </form>
        </DialogContent>
    </Dialog>
  )
}

export default RegistrationDialog