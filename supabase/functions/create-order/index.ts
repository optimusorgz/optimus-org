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
    const { amount } = await req.json();

    // Generate unique order ID
    const orderId = `OPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // For Razorpay integration, you would typically:
    // 1. Create order using Razorpay API
    // 2. Return order details to frontend
    
    // Mock response for now - replace with actual Razorpay integration
    const orderData = {
      order_id: orderId,
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${orderId}`,
      status: 'created'
    };

    console.log('Order created:', orderData);

    return new Response(
      JSON.stringify(orderData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create order',
        message: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});