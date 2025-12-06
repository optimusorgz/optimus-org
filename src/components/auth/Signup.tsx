import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { toast } from 'sonner'
import client from "@/api/client"
import { AuthComponentProps } from './Auth'
import { Eye, EyeOff } from 'lucide-react' // For eye icons

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
    <Card className="w-full bg-gray-800/90 border-gray-700">
      {/* Google Signup Button */}
      <div className="px-6 pt-4 pb-2">
        <Button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-md"
          onClick={handleGoogleSignup}
        >
          Continue with Google
        </Button>
      </div>

      <CardHeader>
        <CardTitle className="text-cyan-400 border-b border-gray-700 pb-2">Sign Up</CardTitle>
        <CardDescription className="text-gray-300">Create a new account</CardDescription>
      </CardHeader>

      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4 px-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" type="text" placeholder="Enter your name" 
              value={name} onChange={(e) => setName(e.target.value)} required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" type="email" placeholder="Enter your email" 
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>

          {/* Password field with eye toggle */}
          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-9 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password field with eye toggle */}
          <div className="space-y-2 relative">
            <Label htmlFor="confirmpassword">Confirm Password</Label>
            <Input
              id="confirmpassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmpassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-9 text-gray-400"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4">
          <Button 
            type="submit" 
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-md"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Create Account'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default Signup
