'use client';

import "./globals.css";
import { AuthProvider } from "@/components/context/authprovider";
import React from 'react';
import { Toaster } from 'sonner';
import Footer from "@/components/footer/footer";
import dynamic from 'next/dynamic';
import { AnimationProvider } from '@/components/AnimationProvider';
import { usePathname } from "next/navigation"; // ✅ IMPORTANT

const DynamicNavbar = dynamic(() => import('@/components/navbar/page'), {
  ssr: false,
  loading: () => <div style={{ height: '64px', backgroundColor: '#1f2937' }}></div>,
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname(); // ✅ get current route

  // ✅ check if auth page
  const isAuthPage = pathname.startsWith("/auth");

  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-white font-sans overflow-x-hidden max-w-full">
        <AuthProvider> 
          <AnimationProvider>

            <div className="w-full overflow-x-hidden max-w-full">
              
              {/* ✅ Hide Navbar on auth */}
              {!isAuthPage && <DynamicNavbar />}

              <main className="w-full overflow-x-hidden max-w-full">
                {children}
              </main>

              {/* ✅ Hide Footer on auth */}
              {!isAuthPage && <Footer />}
              
            </div>

          </AnimationProvider>
        </AuthProvider>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}