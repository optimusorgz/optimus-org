import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      formData 
    } = await req.json();

    // In a real implementation, you would:
    // 1. Verify the payment signature using Razorpay's webhook signature verification
    // 2. Check payment status with Razorpay API
    // 3. Ensure the payment amount matches expected amount
    
    // For now, we'll mock the verification
    const isValidSignature = true; // Replace with actual signature verification
    
    if (!isValidSignature) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'Invalid payment signature' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Log payment verification for debugging
    console.log('Payment verified:', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      formData
    });

    return new Response(
      JSON.stringify({ 
        verified: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ 
        verified: false,
        error: 'Payment verification failed',
        message: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});