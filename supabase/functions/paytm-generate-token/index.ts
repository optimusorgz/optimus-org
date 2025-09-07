import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId, amount, userInfo } = await req.json();

    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real implementation, you would use Paytm's official library
    // For now, we'll create a mock token
    const txnToken = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log the payment request for debugging
    console.log('Payment request received:', {
      eventId,
      amount,
      userInfo,
      orderId,
      txnToken
    });

    return new Response(
      JSON.stringify({
        orderId,
        txnToken,
        amount,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating Paytm token:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate payment token',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});