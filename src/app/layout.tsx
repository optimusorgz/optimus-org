'use client';

import "./globals.css";
import { AuthProvider } from "@/components/context/authprovider";
import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import Footer from "@/components/footer/footer";
import dynamic from 'next/dynamic';
import { AnimationProvider } from '@/components/AnimationProvider';
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "/optimuslogo.png";

const DynamicNavbar = dynamic(() => import('@/components/navbar/page'), {
  ssr: false,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔥 Progress animation
  useEffect(() => {
    let value = 0;

    const interval = setInterval(() => {
      value += Math.random() * 10; // random smooth progress

      if (value >= 100) {
        value = 100;
        clearInterval(interval);

        setTimeout(() => {
          setLoading(false);
        }, 400); // small delay before opening
      }

      setProgress(Math.floor(value));
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // ✅ FULL SCREEN LOADER
  if (loading) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#05070d] flex items-center justify-center min-h-screen overflow-hidden px-4">

        {/* 🔥 Background Glow */}
        <div className="absolute w-[80vw] h-[80vw] md:w-[400px] md:h-[400px] bg-cyan-500/10 blur-[120px] rounded-full"></div>

        {/* 🎮 Loader Container */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-sm md:max-w-md">

          <div>
            <img src="./optimuslogo.png" alt="Optimus Logo" className="w-16 h-18 md:w-24 md:h-26 mb-2 animate-pulse" />
          </div>

          {/* 🔥 Logo */}
          {/* <div className="text-cyan-400 text-3xl md:text-5xl font-extrabold tracking-widest mb-8 md:mb-10 animate-pulse text-center">
            OPTIMUS
          </div> */}

          {/* ⚡ Progress Bar */}
          <div className="md:w-[90%] w-[70%] h-[5px] md:h-[6px] bg-gray-800 rounded-full overflow-hidden border border-cyan-500/20">

            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_15px_#22d3ee]"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.15 }}
            />

          </div>

          {/* 🔢 Percentage */}
          <div className="mt-4 text-cyan-300 text-xs md:text-sm tracking-widest font-mono text-center">
            LOADING... {progress}%
          </div>

          {/* 🧠 Subtext */}
          <div className="mt-2 text-gray-500 text-[10px] md:text-xs tracking-wider text-center">
            INITIALIZING SYSTEM
          </div>

        </div>

        {/* ⚡ Scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_95%,rgba(0,255,255,0.05)_100%)] bg-[length:100%_4px]"></div>

      </body>
    </html>
  );


  }

  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-white font-sans overflow-x-hidden max-w-full">
        <AuthProvider> 
          <AnimationProvider>

            <div className="w-full overflow-x-hidden max-w-full">
              
              {!isAuthPage && <DynamicNavbar />}

              <main className="w-full overflow-x-hidden max-w-full">
                {children}
              </main>

              {!isAuthPage && <Footer />}
              
            </div>

          </AnimationProvider>
        </AuthProvider>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}