import { useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        // ✅ User is logged in
        console.log("Google user:", data.session.user);
        navigate("/dashboard");
      } else {
        console.error("Auth error:", error);
        navigate("/auth");
      }
    };
    handleAuth();
  }, [navigate]);

  return <p>Signing you in...</p>;
}
