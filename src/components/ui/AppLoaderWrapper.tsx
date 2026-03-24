'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AppLoaderWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // ✅ Wait for client mount FIRST
  useEffect(() => {
    setMounted(true);

    const hasLoaded = sessionStorage.getItem("hasLoaded");

    if (!hasLoaded) {
      setLoading(true);
    }
  }, []);

  // ✅ Run loader ONLY if needed
  useEffect(() => {
    if (!loading) return;

    let value = 0;

    const interval = setInterval(() => {
      value += Math.random() * 10;

      if (value >= 100) {
        value = 100;
        clearInterval(interval);

        setTimeout(() => {
          setLoading(false);
          sessionStorage.setItem("hasLoaded", "true");
        }, 300);
      }

      setProgress(Math.floor(value));
    }, 120);

    return () => clearInterval(interval);
  }, [loading]);

  // 🚫 Prevent ANY render before mount (this removes flicker completely)
  if (!mounted) return null;

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-[#05070d] flex items-center justify-center z-[9999] px-4">

          <div className="flex flex-col items-center w-full max-w-sm md:max-w-md">

            <div>
                <img src="./optimuslogo.png" alt="optimus logo" className="h-16 md:h-20 w-14 md:w-18" />
            </div>

            {/* <div className="text-cyan-400 text-3xl md:text-5xl font-extrabold mb-8 animate-pulse">
              OPTIMUS
            </div> */}

            <div className="w-[60%] md:w-[90%] h-[5px] md:h-[6px] bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
                animate={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 text-cyan-300 text-xs md:text-sm font-mono">
              LOADING... {progress}%
            </div>

            <div className="mt-2 text-gray-500 text-[10px] md:text-xs tracking-wider text-center">
                INITIALIZING SYSTEM
            </div>


          </div>
        </div>
      )}

      {children}
    </>
  );
}