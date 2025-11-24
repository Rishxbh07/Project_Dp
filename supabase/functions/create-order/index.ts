import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Razorpay from "https://esm.sh/razorpay@latest";
import crypto from "https://deno.land/std@0.168.0/node/crypto.ts";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Create-order function (Secure Server-Side Calc) loaded!");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Receive Intent (NOT Amount)
    const { listing_id, user_id, payment_option, use_coins } = await req.json();

    if (!listing_id || !user_id) {
      throw new Error("Missing listing_id or user_id");
    }

    // Initialize Supabase Client with Service Role (Admin) to fetch prices securely
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
    );

    // 2. Fetch REAL Price from Database
    const { data: listing, error: dbError } = await supabaseClient
      .from('listings')
      .select('*, service:services(*)')
      .eq('id', listing_id)
      .single();

    if (dbError || !listing) throw new Error("Listing not found or database error");

    // 3. Calculate Wallet Discount (Server-Side Check)
    let coinDiscount = 0;
    if (use_coins) {
        const { data: wallet } = await supabaseClient
            .from('credit_wallets')
            .select('credit_balance')
            .eq('user_id', user_id)
            .single();
        
        // Only apply discount if they actually have the coins
        if (wallet && wallet.credit_balance >= 10) {
            coinDiscount = 10;
        }
    }

    // 4. Perform Price Calculation
    const basePrice = Number(listing.service.base_price);
    const commissionRate = Number(listing.service.platform_commission_rate) / 100;
    const platformFee = basePrice * commissionRate;
    
    let convenienceFee = 0;
    let taxRate = 0.12; // Standard 12% GST

    if (payment_option === 'oneTime') {
        convenienceFee = basePrice * 0.10;
        taxRate = 0.18; // Higher tax for one-time
    }

    const subtotal = basePrice + platformFee + convenienceFee;
    const tax = subtotal * taxRate;
    const totalAmount = subtotal + tax - coinDiscount;

    // Safety: Ensure we never charge less than ₹1
    const finalAmount = Math.max(totalAmount, 1);

    // 5. Create Razorpay Order
    const razorpay = new Razorpay({
      key_id: Deno.env.get("RAZORPAY_KEY_ID")!,
      key_secret: Deno.env.get("RAZORPAY_KEY_SECRET")!,
    });

    const shortId = crypto.randomBytes(4).toString('hex');
    const options = {
      amount: Math.round(finalAmount * 100), // Amount in paise
      currency: "INR",
      receipt: `rcpt_${shortId}`,
      notes: {
        listing_id: listing_id,
        user_id: user_id,
        plan_name: listing.service.name
      }
    };

    const order = await razorpay.orders.create(options);

    // Return the order + the calculated total for UI verification
    return new Response(JSON.stringify({ 
        ...order,
        server_calculated_total: finalAmount.toFixed(2) 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in create-order:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});