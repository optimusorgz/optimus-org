// frontend/src/payments.ts
interface CreateOrderResponse {
  id: string;
  currency: string;
  amount: number;
}

export const initiatePayment = async (amount: number) => {
  // Call your Supabase function
  const res = await fetch("/supabase/functions/v1/createOrder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, receipt: "receipt#1" }),
  });
  const order: CreateOrderResponse = await res.json();

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // from frontend env
    amount: order.amount,
    currency: order.currency,
    name: "Your Website Name",
    description: "Test Transaction",
    order_id: order.id,
    handler: function (response: any) {
      console.log("Payment Success:", response);
      // You can verify payment on backend here
    },
    prefill: {
      name: "John Doe",
      email: "john@example.com",
      contact: "9999999999",
    },
    theme: {
      color: "#3399cc",
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
