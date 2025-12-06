'use client';

import React, { useState } from 'react';
import supabase from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Please enter your registered email.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success('Password reset link has been sent to your email.');
      setEmail('');
    }

    setLoading(false);
  };

  return (
    <Card className="w-full bg-gray-800/90 border-gray-700">
      <CardHeader>
        <CardTitle className="text-cyan-400 border-b border-gray-700 pb-2">
          Forgot Password
        </CardTitle>
        <CardDescription className="text-gray-300">
          Enter your registered email to receive a password reset link.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-6">
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

        <Button
          onClick={handleResetPassword}
          disabled={loading || !email}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-md"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <div className="text-gray-400 text-sm text-center">
          <p>We’ll send a reset link to your registered email.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
