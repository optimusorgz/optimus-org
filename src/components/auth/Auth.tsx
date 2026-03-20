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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0B0F] p-0 sm:p-4 overflow-hidden">
        {/* BACK BUTTON */}
    <button
      onClick={() => router.back()}
      className="absolute top-4 left-4 z-20 
      flex items-center gap-1 text-xs text-slate-300 hover:text-cyan-400 transition"
    >
      <ArrowLeft size={18} />
      
    </button>

  <div className="w-full max-w-6xl h-full sm:h-auto grid lg:grid-cols-2 
    rounded-none sm:rounded-xl overflow-hidden 
    shadow-[0_0_40px_rgba(139,92,246,0.12)] 
    border-0 sm:border border-white/10 relative">

    

    {/* LEFT SIDE */}
    <div
      className="hidden lg:flex items-center justify-center relative bg-cover bg-center"
      style={{
        backgroundImage: `url('https://i.pinimg.com/1200x/99/4d/a7/994da7cd2d8872385656e3281d8da294.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-black/80 to-black" />
      <div className="absolute w-[250px] h-[250px] bg-purple-500/30 blur-3xl rounded-full top-6 left-6" />
    </div>

    {/* RIGHT SIDE */}
    <div className="flex items-center justify-center 
      p-3 sm:p-6 
      bg-gradient-to-br from-[#16161D] to-[#0F0F12] relative">

      {/* Glow Accent */}
      <div className="absolute w-[150px] h-[150px] bg-cyan-500/10 blur-2xl rounded-full bottom-6 right-6" />

      <div className="w-full h-full sm:h-auto 
        rounded-none sm:rounded-xl 
        p-2 sm:p-3 
        bg-white/5 backdrop-blur-xl 
        border-0 sm:border border-white/10">

        <Tabs 
          defaultValue="login" 
          className="min-h-[480px] md:min-h-auto flex flex-col overflow-hidden"
        >

          <TabsList className="grid grid-cols-2 bg-[#1F1F29] rounded-lg w-full">
            <TabsTrigger 
              value="login"
              className="text-sm data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              Login
            </TabsTrigger>

            <TabsTrigger 
              value="signup"
              className="text-sm data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              Signup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="flex-1 mt-2">
            <LoginComponent onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="signup" className="flex-1 mt-2">
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