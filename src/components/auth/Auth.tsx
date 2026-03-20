'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "./Login";
import Signup from "./Signup";
import React from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export interface AuthComponentProps {
  onSuccess: () => void;
}

const LoginComponent = Login as React.FC<AuthComponentProps>;
const SignupComponent = Signup as React.FC<AuthComponentProps>;

interface AuthProps extends AuthComponentProps {}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
    const router = useRouter();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0B0F] p-4 sm:p-6">

  <div className="w-full max-w-6xl grid lg:grid-cols-2 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.15)] border border-white/10 backdrop-blur-xl">

    {/* LEFT SIDE */}
    <div
      className="hidden lg:flex items-center justify-center relative bg-cover bg-center"
      style={{
        backgroundImage: `url('https://i.pinimg.com/1200x/99/4d/a7/994da7cd2d8872385656e3281d8da294.jpg')`,
      }}
    >
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-black/80 to-black" />

      {/* Glow Effect */}
      <div className="absolute w-[300px] h-[300px] bg-purple-500/40 blur-3xl rounded-full top-10 left-10" />

      {/* Content */}
      {/* <div className="relative z-10 max-w-md p-10 text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">
          Welcome 🚀
        </h1>
        <p className="text-slate-300">
          Build and manage your platform with ease.
        </p>
      </div> */}
    </div>

      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-slate-100 hover:text-cyan-400 transition"
      >
        <ArrowLeft size={20} />
        Back
      </button>
    {/* RIGHT SIDE */}
    <div className="flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-[#16161D] to-[#0F0F12] relative">

      {/* Glow Accent */}
      <div className="absolute w-[200px] h-[200px] bg-cyan-500/10 blur-2xl rounded-full bottom-10 right-10" />

      {/* BACK BUTTON */}

      <div className="w-full rounded-2xl p-4 bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">

        <Tabs defaultValue="login" className="max-h-[740px] md:max-h-auto flex flex-col overflow-hidden">

          <TabsList className="grid grid-cols-2 bg-[#1F1F29] rounded-xl w-full border border-white/5">
            <TabsTrigger 
            value="login"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
            Login
            </TabsTrigger>

            <TabsTrigger 
            value="signup"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
            Signup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginComponent onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="signup">
            <SignupComponent onSuccess={onSuccess} />
          </TabsContent>

        </Tabs>

      </div>

    </div>
  </div>
</div>
  );
};

export default Auth;