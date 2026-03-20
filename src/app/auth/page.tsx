'use client';

import React from 'react';
import Auth from "@/components/auth/Auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/event-page"); // change if needed
  };

  return <Auth onSuccess={handleSuccess} />;
}