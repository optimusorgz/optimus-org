'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { toast } from 'sonner';
import client from "@/api/client";
import { AuthComponentProps } from './Auth';
import { Eye, EyeOff } from 'lucide-react';
import ForgotPassword from './ForgotPassword';

const Login: React.FC<AuthComponentProps> = ({ onSuccess }) => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false); // ✅ Added this state

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error('Please enter your email and password.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.success('Login successful!');
        onSuccess();
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) toast.error(`Google login failed: ${error.message}`);
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error during Google login.');
    }
  };

  // ✅ Forgot Password Page Toggle
  if (showForgot) {
    return (
      <div className="w-full">
        <ForgotPassword />
        <p
          onClick={() => setShowForgot(false)}
          className="text-sm text-white-600 hover:underline cursor-pointer text-center mt-4"
        >
          Back to Login
        </p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-full bg-transparent border-t border-b border-gray-700 overflow-x-hidden" >
      {/* Google Login Button */}
      <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2">
        <Button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 sm:py-3 rounded-md text-sm sm:text-base"
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </Button>
      </div>

      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-cyan-400 border-b border-gray-700 pb-2 text-lg sm:text-xl">Login</CardTitle>
        <CardDescription className="text-gray-300 text-sm sm:text-base">Sign in to your account</CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
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
        </CardContent>

        <div className="px-4 sm:px-6">
          <p
            onClick={() => setShowForgot(true)}
            className="text-xs sm:text-sm text-white-600 hover:underline cursor-pointer text-right"
          >
            Forgot password?
          </p>
        </div>

        <CardFooter className="px-4 sm:px-6 py-3 sm:py-4">
          <Button 
            type="submit" 
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 sm:py-3 rounded-md text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Sign In'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Login;
