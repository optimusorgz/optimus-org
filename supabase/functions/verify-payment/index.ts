import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.190.0/hash/mod.ts";

serve(async (req: Request) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json() as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

    const key_secret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const hmac = createHmac("sha256", key_secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.toString(); // hex string

    const verified = digest === razorpay_signature;

    return new Response(JSON.stringify({ verified }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
