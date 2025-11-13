'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const ResetPasswordPage = () => {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdatePassword = async () => {
    if (!password || !confirm) {
      toast.error('Please fill out both fields.');
      return;
    }

    if (password !== confirm) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success('Password updated successfully! Redirecting...');
      setPassword('');
      setConfirm('');
      setTimeout(() => {
        router.push('/'); // redirect to home page (you can change this to '/login')
      }, 2000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-sm bg-gray-800/90 border-gray-700">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-2 text-gray-400 hover:text-green-400"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <CardTitle className="text-green-400 border-b border-gray-700 pb-2 text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-gray-300 text-center">
            Enter and confirm your new password below.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-6">
          {/* Password Field */}
          <div className="space-y-2 relative">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2 relative">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 flex flex-col gap-3">
          <Button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>

          <Button
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
