

import { useState } from 'react'
import { Eye, EyeOff, LogIn, Mail } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Login, ForgotPassword } from '@/service/API' // Giả định bạn có hàm ForgotPassword trong service
import { useNavigate } from 'react-router-dom'
import { Loader2 } from "lucide-react"
import { useToast } from '@/hooks/use-toast'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState<boolean>(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
 
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleLogin = async () => {
    setLoading(true)
    try {
      const data = await Login(email, password)
      localStorage.setItem("access_token", data?.data.access_token)
      localStorage.setItem("user_id", data?.data.user._id)
      localStorage.setItem("family_id", data?.data.user.family_id)
      localStorage.setItem("isAdmin", data?.data.user.role === "admin" ? "true" : "false")
      navigate('/')
    } catch (e) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      })
      setEmailError('Invalid username or password')
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    setForgotLoading(true)
    try {
      await ForgotPassword(forgotEmail)
      toast({
        title: "Email Sent",
        description: "A reset password email has been sent to your inbox.",
      })
      setForgotEmail('')
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to send reset email. Please check the email address.",
        variant: "destructive",
      })
    }
    setForgotLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin()
    setPasswordError('')
    setEmailError('')
  }

  return (
    <div className="bg-[url('/bg.png')] w-full bg-cover bg-center min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Login</CardTitle>
          <CardDescription className="text-center text-gray-200">
            Enter your username and password to login to your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input 
                id="email" 
                type="text" 
                placeholder="username" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 text-white placeholder-gray-300"
              />
              {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
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
              {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white" type="submit">
              {
                loading ? (<Loader2 className="animate-spin" />) : (<LogIn className="mr-2 h-4 w-4" /> )
              }
              Login
            </Button>
            <Dialog>
                <div className='flex items-center w-full justify-between'>
              <DialogTrigger asChild>
                <Button variant="link" className="text-blue-200 hover:underline">
                  Forgot Password?
                </Button>
              </DialogTrigger>
                <Button 
                onClick={() => {
                  navigate('/register')
                }}
                variant="link" className="text-blue-200 hover:underline">
                  Register
                </Button>
                </div>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Forgot Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleForgotPassword}
                    disabled={forgotLoading || !validateEmail(forgotEmail)}
                  >
                    {forgotLoading ? <Loader2 className="animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Send Reset Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage