'use client'

import React, { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert"

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

    
    addMember({
      id: 'hehe',
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Family Members</h2>
      <ul className="space-y-2">
        {members.map((member) => (
          <li key={member.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
            <span>{member.name}</span>
            <span className="text-sm text-gray-500">
              {member.role} - {member.specificRole}
            </span>
          </li>
        ))}
      </ul>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Add New Member</Button>
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
    </div>
  );
}

