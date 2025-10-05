import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import Razorpay from "https://esm.sh/razorpay@latest";
import crypto from "https://deno.land/std@0.168.0/node/crypto.ts";

console.log("Create-order function (v2 - receipt fix) loaded!");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount } = await req.json();

    const razorpay = new Razorpay({
      key_id: Deno.env.get("RAZORPAY_KEY_ID")!,
      key_secret: Deno.env.get("RAZORPAY_KEY_SECRET")!,
    });

    // --- THIS IS THE FIX ---
    // We now use a shorter, 8-character random string instead of a full UUID.
    const shortId = crypto.randomBytes(4).toString('hex');

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${shortId}`, // Total length will be well under 40
    };

    const order = await razorpay.orders.create(options);

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});