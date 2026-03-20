import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { toast } from 'sonner'
import client from "@/api/client"
import { AuthComponentProps } from './Auth'
import { Eye, EyeOff, Mail, Lock, User, Chrome } from 'lucide-react' // For eye icons


const CARD_CLASSES = "w-full border-gray-800 bg-gray-950/50 backdrop-blur-md shadow-2xl overflow-hidden h-[90%]";
const PRIMARY_BUTTON = "w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all duration-200 active:scale-[0.98] py-6";
const GOOGLE_BUTTON = "w-full flex items-center justify-center gap-2 border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-100 font-medium transition-all duration-200 py-6";
const INPUT_CLASSES = "bg-gray-900/50 border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all pl-10 h-11 text-white";


const Signup: React.FC<AuthComponentProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmpassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    if (!email || !password || !confirmpassword || !name) {
      toast.error('Please fill in all fields')
      setLoading(false)
      return
    }

    if (password !== confirmpassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      })

      if (error) toast.error(`Signup failed: ${error.message}`)
      else if (data.user) {
        if (!data.session) {
          toast.success('Registration successful! Please check your email to confirm.')
        } else {
          toast.success('Signup successful! Welcome.')
          onSuccess()
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Unexpected error during signup.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) toast.error(`Google login failed: ${error.message}`)
    } catch (err) {
      console.error(err)
      toast.error('Unexpected error during Google signup.')
    }
  }

  return (
    
    <Card className={CARD_CLASSES}>
      <CardHeader className="space-y-1 pt-2">
        <CardTitle className="text-2xl font-bold tracking-tight text-white text-center">Create an account</CardTitle>
        <CardDescription className="text-gray-400 text-center">
          Enter your details to get started
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <Button variant="outline" className={GOOGLE_BUTTON} onClick={handleGoogleSignup}>
          <Chrome size={18} className="text-cyan-400" />
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#030712] px-2 text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Name */}
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="name" className="text-gray-300 ml-1">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-500" size={18} />
              <Input 
                id="name"
                placeholder="John Doe" 
                className={INPUT_CLASSES}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="email" className="text-gray-300 ml-1">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
              <Input 
                id="email"
                type="email"
                placeholder="name@example.com" 
                className={INPUT_CLASSES}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="password" className="text-gray-300 ml-1">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={INPUT_CLASSES}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="confirmpassword" className="text-gray-300 ml-1">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
              <Input
                id="confirmpassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={INPUT_CLASSES}
                value={confirmpassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button FULL WIDTH */}
          <div className="md:col-span-2">
            <Button type="submit" className={`${PRIMARY_BUTTON} mt-2`} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>

        </form>
      </CardContent>
      <CardFooter className="pb-8">
              <p className="w-full text-center text-sm text-gray-500">
                By clicking continue, you agree to our Terms of Service.
              </p>
            </CardFooter>
    </Card>

  )
}

export default Signup
