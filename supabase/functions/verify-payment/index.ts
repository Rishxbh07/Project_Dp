import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import crypto from "https://deno.land/std@0.168.0/node/crypto.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        razorpay_subscription_id // Sent by frontend if it was Autopay
    } = body;
    
    const key_secret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    let generatedSignature = "";

    // 1. Verify SUBSCRIPTION (Auto Pay)
    if (razorpay_subscription_id) {
        // Formula: razorpay_payment_id + "|" + razorpay_subscription_id
        const data = `${razorpay_payment_id}|${razorpay_subscription_id}`;
        generatedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(data.toString())
            .digest("hex");
    } 
    // 2. Verify ORDER (One Time)
    else {
        // Formula: razorpay_order_id + "|" + razorpay_payment_id
        const data = `${razorpay_order_id}|${razorpay_payment_id}`;
        generatedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(data.toString())
            .digest("hex");
    }

    if (generatedSignature === razorpay_signature) {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ status: "error", message: "Invalid Signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});