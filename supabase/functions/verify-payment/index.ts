import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import crypto from "https://deno.land/std@0.168.0/node/crypto.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the details sent back from the Razorpay checkout on the frontend
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    const key_secret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    // Create the signature that Razorpay *should* have sent.
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    // Compare your generated signature with the one from Razorpay
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // If they match, the payment is authentic.
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // If they don't match, the payment is fraudulent or there's an error.
      return new Response(JSON.stringify({ status: "error" }), {
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