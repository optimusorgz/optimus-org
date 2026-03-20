'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { toast } from 'sonner';
import client from "@/api/client";
import { AuthComponentProps } from './Auth';
import { Eye, EyeOff, Mail, Lock, User, Chrome } from 'lucide-react' // For eye icons
import ForgotPassword from './ForgotPassword';

const CARD_CLASSES = `
w-full border-gray-800 bg-gray-950/50 backdrop-blur-md shadow-2xl overflow-hidden
h-auto sm:h-[90%]
`;

const PRIMARY_BUTTON = `
w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold 
transition-all duration-200 active:scale-[0.98] 
py-3 sm:py-6
`;

const GOOGLE_BUTTON = `
w-full flex items-center justify-center gap-2 
border-gray-700 bg-gray-900 hover:bg-gray-800 
text-gray-100 font-medium transition-all duration-200 
py-3 sm:py-6
`;

const INPUT_CLASSES = `
bg-gray-900/50 border-gray-700 focus:border-cyan-500 
focus:ring-cyan-500/20 transition-all pl-10 
h-10 sm:h-11 text-white
`;

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
    <Card className={CARD_CLASSES}>
      <CardHeader className="space-y-1 pt-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-white text-center">Welcome back</CardTitle>
        
      </CardHeader>

      <CardContent className="grid gap-4">
        <Button variant="outline" className={GOOGLE_BUTTON} onClick={handleGoogleLogin}>
          <Chrome size={18} className="text-cyan-400" />
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#030712] px-2 text-gray-500 font-medium">Or use email</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300 ml-1">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
              <Input 
                id="email" type="email" placeholder="name@example.com" 
                className={INPUT_CLASSES}
                value={email} onChange={(e) => setEmail(e.target.value)} required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-300 ml-1">Password</Label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors mr-1"
              >
                Forgot password?
              </button>
            </div>
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
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" className={`${PRIMARY_BUTTON} mt-2`} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="pb-8">
        <p className="w-full text-center text-sm text-gray-500">
          By clicking continue, you agree to our Terms of Service.
        </p>
      </CardFooter>
    </Card>
  );
};

export default Login;
