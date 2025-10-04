import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import Razorpay from "https://cdn.skypack.dev/razorpay";

// This is the main function that will be executed when the endpoint is called
serve(async (req) => {
  // This part handles the "preflight" request that browsers send to check CORS.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the 'amount' that your React app will send in the request body.
    const { amount } = await req.json();

    // Initialize Razorpay with your secret keys stored securely in Supabase.
    const razorpay = new Razorpay({
      key_id: Deno.env.get("RAZORPAY_KEY_ID")!,
      key_secret: Deno.env.get("RAZORPAY_KEY_SECRET")!,
    });

    // Prepare the order details. The amount must be in the smallest currency unit (paise).
    const options = {
      amount: amount * 100, // Example: 500 INR becomes 50000 paise
      currency: "INR",
      receipt: `receipt_${crypto.randomUUID()}`, // A unique receipt ID
    };

    // Ask the Razorpay API to create the order.
    const order = await razorpay.orders.create(options);

    // Send the created order details back to your React app.
    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // If anything goes wrong, send back an error message.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});