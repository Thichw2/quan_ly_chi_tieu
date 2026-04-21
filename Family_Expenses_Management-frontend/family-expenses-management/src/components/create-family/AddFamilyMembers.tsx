'use client'

import React, { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/alert"

type Member = {
  id: string;
  username: string;
  name: string;
  isNew: boolean;
  password: string;
  email?: string;
  role?: string;
  specificRole?: string;
}

type Props = {
  members: Member[];
  addMember: (member: Member) => void;
}

type FormErrors = {
  [key: string]: string;
}

export default function AddFamilyMembers({ members, addMember }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        return value.trim().length < 2 ? 'Họ và tên phải có ít nhất 2 ký tự' : '';
      case 'username':
        return !/^[a-zA-Z0-9_]{3,20}$/.test(value) ? 'Tên đăng nhập từ 3-20 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Địa chỉ email không hợp lệ' : '';
      case 'password':
        return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value) ? 'Mật khẩu phải ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số' : '';
      case 'confirmPassword':
        return value !== newMember.password ? 'Mật khẩu xác nhận không khớp' : '';
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

    addMember({
      id: Math.random().toString(36).substr(2, 9), // Tạo ID ngẫu nhiên thay vì 'hehe'
      username: newMember.username,
      name: newMember.fullName,
      isNew: true,
      password: newMember.password,
      email: newMember.email,
      role: newMember.role,
      specificRole: newMember.specificRole
    });

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

  const translateRole = (role?: string) => {
    if (role === 'admin') return 'Quản trị viên';
    if (role === 'member') return 'Thành viên';
    return role;
  };

  const translateSpecificRole = (role?: string) => {
    if (role === 'grandparent') return 'Ông bà';
    if (role === 'parent') return 'Cha mẹ';
    return role;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Thành viên gia đình</h2>
      <ul className="space-y-2">
        {members.map((member) => (
          <li key={member.id} className="flex justify-between items-center p-2 bg-gray-100 rounded border">
            <span className="font-medium">{member.name}</span>
            <span className="text-sm text-gray-500">
              {translateRole(member.role)} - {translateSpecificRole(member.specificRole)}
            </span>
          </li>
        ))}
      </ul>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Thêm thành viên mới</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm thành viên mới vào gia đình</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4">
            {/* Họ và tên */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={newMember.fullName}
                onChange={handleInputChange}
                required
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
            </div>

            {/* Tên đăng nhập */}
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                name="username"
                placeholder="vanna123"
                value={newMember.username}
                onChange={handleInputChange}
                required
              />
              {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="vi-du@email.com"
                value={newMember.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Mật khẩu */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
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

            {/* Xác nhận mật khẩu */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
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

            {/* Quyền hệ thống */}
            <div className="space-y-2">
              <Label htmlFor="role">Quyền hệ thống</Label>
              <Select
                onValueChange={(value) => handleSelectChange('role', value)}
                value={newMember.role}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quyền" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="member">Thành viên thường</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vai trò gia đình */}
            <div className="space-y-2">
              <Label htmlFor="specificRole">Vai trò trong gia đình</Label>
              <Select
                onValueChange={(value) => handleSelectChange('specificRole', value)}
                value={newMember.specificRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grandparent">Ông bà</SelectItem>
                  <SelectItem value="parent">Cha mẹ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full">Thêm thành viên</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}