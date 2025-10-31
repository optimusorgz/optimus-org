// server.js (Node.js/Express Example)
require('dotenv').config();

const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const app = express();
const PORT = 3000;

// Middleware for parsing JSON body
app.use(express.json()); 

// Initialize Razorpay instance (use process.env for production)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID', // Set as env variable
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET', // Set as env variable
});

// 1. Endpoint to create the order
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount, eventTitle } = req.body; // Expect amount in rupees/dollars from frontend

        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise (Razorpay standard)
            currency: "INR",
            receipt: `receipt_event_${Date.now()}`,
            notes: { event: eventTitle }
        });

        // Send the essential order ID back to the frontend
        res.status(200).json({
            order_id: order.id,
            currency: order.currency,
            amount: order.amount, // amount is in paise
        });

    } catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        res.status(500).send("Failed to create Razorpay order.");
    }
});

// ... (other routes)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));