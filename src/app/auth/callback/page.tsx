"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import client from "@/api/client";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await client.auth.getSession();

      if (error) {
        console.error(error);
        router.push("/auth");
      } else {
        router.push("/event-page");
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F12]">
      <div className="flex flex-col items-center gap-4">

        {/* Loader */}
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />

        {/* Optional text */}
        <p className="text-sm text-slate-400">
          Logging you in...
        </p>

      </div>
    </div>
  );
}