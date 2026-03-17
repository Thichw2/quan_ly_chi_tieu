'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { RegistrationSuccessDialog } from '@/components/register/RegistrationSuccess'

import { RegisterUser } from '@/service/API'


const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState<boolean>(false)
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('')
  const [showDialog, setShowDialog] = useState(false)
  const handleChange = (value: string) => {
    setSelectedRole(value);
    console.log("Selected Role:", value); 
  };


  const handleRegisterUser = async () => {
    setLoading(true)
    try {
      await RegisterUser(userName, email, password, name, selectedRole)
      setTimeout(() => {
        setShowDialog(true)
      }, 500)
    } catch (e) {
      console.log(e)
    }
    setLoading(false)
  }

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    return regex.test(password)
  }

  useEffect(() => {
    if (isSubmitting) {
      setEmailError(validateEmail(email) ? '' : 'Please enter a valid email address')
      setPasswordError(validatePassword(password) ? '' : 'Password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, and 1 number')
      setConfirmPasswordError(password === confirmPassword ? '' : 'Passwords do not match')
    }
  }, [name, email, password, confirmPassword, isSubmitting])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (validateEmail(email) && validatePassword(password) && password === confirmPassword) {
      handleRegisterUser()
    }
  }

  return (
    <div className="bg-[url('/bg.png')] w-full bg-cover bg-center min-h-screen flex items-center justify-center relative overflow-hidden">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-xl z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Create an account</CardTitle>
          <CardDescription className="text-center text-gray-200">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/20 text-white placeholder-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 text-white placeholder-gray-300"
              />
              <p className={`text-red-400 text-sm transition-all duration-300 ${emailError ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'}`}>
                {emailError}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input 
                id="email" 
                type="text" 
                placeholder="example" 
                required 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-white/20 text-white placeholder-gray-300"
              />
              <p className={`text-red-400 text-sm transition-all duration-300 ${emailError ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'}`}>
                {emailError}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/20 text-white"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </button>
              </div>
              <p className={`text-red-400 text-sm transition-all duration-300 ${passwordError ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'}`}>
                {passwordError}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/20 text-white"
              />
              <p className={`text-red-400 text-sm transition-all duration-300 ${confirmPasswordError ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'}`}>
                {confirmPasswordError}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-white">Roles</Label>
              <Select onValueChange={handleChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="grandchild">Grandchild</SelectItem>
                    <SelectItem value="grandfather">Grandfather</SelectItem>
                    <SelectItem value="grandmother">Grandmother</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" type="submit">
              {
                loading ? (<Loader2 className="animate-spin" />) : (<UserPlus className="mr-2 h-4 w-4" />  )
              }
              Register
            </Button>
            <p className="text-sm text-center text-gray-300">
              Already have an account?{" "}
              <a href="/login" className="text-blue-400 hover:underline">
                Login
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
      <RegistrationSuccessDialog isOpen={showDialog} onClose={() => setShowDialog(false)} />
    </div>
  )
}

export default RegisterPage

