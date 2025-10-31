// server.js (Continuation)
require('dotenv').config();
// 2. Endpoint to verify the payment signature
app.post('/api/verify-payment', async (req, res) => {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature 
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET';

    // 1. Construct the data string
    const data = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    // 2. Compute the Hmac signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(data);
    const digest = shasum.digest('hex');

    // 3. Compare the computed signature with the one received
    if (digest === razorpay_signature) {
        // Verification SUCCESS
        // You can fetch payment details from Razorpay API here if needed, but verification is enough for security
        res.status(200).json({ 
            verified: true, 
            message: "Payment verified successfully" 
        });
    } else {
        // Verification FAILURE
        res.status(400).json({ 
            verified: false, 
            message: "Signature verification failed" 
        });
    }
});