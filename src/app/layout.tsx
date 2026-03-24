'use client';

import "./globals.css";
import { AuthProvider } from "@/components/context/authprovider";
import React from 'react';
import { Toaster } from 'sonner';
import Footer from "@/components/footer/footer";
import dynamic from 'next/dynamic';
import { AnimationProvider } from '@/components/AnimationProvider';
import { usePathname } from "next/navigation";
import AppLoaderWrapper from "@/components/ui/AppLoaderWrapper";

const DynamicNavbar = dynamic(() => import('@/components/navbar/page'), {
  ssr: false,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-white font-sans overflow-x-hidden max-w-full">
        <AuthProvider> 
          <AnimationProvider>

            {/* ✅ Loader wrapper handles everything */}
            <AppLoaderWrapper>

              <div className="w-full overflow-x-hidden max-w-full">
                
                {!isAuthPage && <DynamicNavbar />}

                <main className="w-full overflow-x-hidden max-w-full">
                  {children}
                </main>

                {!isAuthPage && <Footer />}
                
              </div>

            </AppLoaderWrapper>

          </AnimationProvider>
        </AuthProvider>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}