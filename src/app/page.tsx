'use client';

import React from "react";
import { useAuth } from "@/components/context/authprovider";
import { useRouter } from "next/navigation";
import HomePage from "./home/page";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    // Full-screen skeleton that roughly mirrors the landing layout:
    // hero heading + subheading + two buttons.
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-full max-w-3xl px-4 space-y-4">
          {/* Hero heading */}
          <Skeleton className="h-10 w-2/3 mx-auto" />
          {/* Subheading */}
          <Skeleton className="h-4 w-5/6 mx-auto" />
          <Skeleton className="h-4 w-4/6 mx-auto" />
          {/* Buttons row */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Skeleton className="h-11 w-40 rounded-md" />
            <Skeleton className="h-11 w-40 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <HomePage />
    </>
  );
}
