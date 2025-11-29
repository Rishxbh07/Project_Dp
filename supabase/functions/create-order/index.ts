import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Razorpay from "https://esm.sh/razorpay@latest";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Create-order function (Booking First Fix) loaded!");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Accept booking_id from the client
    const { listing_id, user_id, payment_option, use_coins, booking_id } = await req.json();

    if (!listing_id || !user_id) throw new Error("Missing parameters");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
    );

    // Fetch Listing
    const { data: listing, error: dbError } = await supabaseAdmin
      .from('listings')
      .select('*, service:services(*)')
      .eq('id', listing_id)
      .single();

    if (dbError || !listing) throw new Error("Listing not found");

    // Wallet Logic
    let coinDiscount = 0;
    if (use_coins) {
        const { data: wallet } = await supabaseAdmin
            .from('credit_wallets')
            .select('credit_balance')
            .eq('user_id', user_id)
            .single();
        if (wallet && wallet.credit_balance >= 10) coinDiscount = 10;
    }

    const razorpay = new Razorpay({
      key_id: Deno.env.get("RAZORPAY_KEY_ID")!,
      key_secret: Deno.env.get("RAZORPAY_KEY_SECRET")!,
    });

    const basePrice = Number(listing.service.base_price);
    const commissionRate = Number(listing.service.platform_commission_rate) / 100;
    const GST_RATE = 0.18;

    let responsePayload = {};
    let transactionRecord = {};

    // --- AUTO PAY ---
    if (payment_option === 'autoPay') {
        const recurringBase = basePrice;
        const recurringTax = recurringBase * GST_RATE;
        const recurringTotalPaise = Math.round((recurringBase + recurringTax) * 100);

        const platformFee = basePrice * commissionRate;
        const upfrontTax = platformFee * GST_RATE;
        const upfrontTotal = Math.max((platformFee + upfrontTax) - coinDiscount, 1);
        const upfrontTotalPaise = Math.round(upfrontTotal * 100);

        let planId = listing.service.razorpay_plan_id;
        if (!planId) {
            const plan = await razorpay.plans.create({
                period: "monthly",
                interval: 1,
                item: {
                    name: `${listing.service.name} Monthly`,
                    amount: recurringTotalPaise,
                    currency: "INR",
                    description: "Monthly subscription"
                },
                notes: { service_id: listing.service.id }
            });
            planId = plan.id;
            await supabaseAdmin.from('services').update({ razorpay_plan_id: planId }).eq('id', listing.service.id);
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            total_count: 120,
            quantity: 1,
            customer_notify: 1,
            notes: { listing_id, user_id, booking_id }, 
            addons: [{
                item: { name: "DapBuddy Shield (Joining Fee)", amount: upfrontTotalPaise, currency: "INR" }
            }]
        });

        responsePayload = {
            id: subscription.id,
            is_subscription: true,
            subscription_id: subscription.id,
            plan_id: planId,
            currency: "INR",
            key: Deno.env.get("RAZORPAY_KEY_ID") 
        };

        transactionRecord = {
            booking_id: booking_id || null, // <--- SAVES THE BOOKING ID
            buyer_id: user_id,
            gateway_transaction_id: subscription.id,
            original_amount: (recurringBase + platformFee).toFixed(2),
            final_amount_charged: (recurringTotalPaise + upfrontTotalPaise) / 100,
            credits_used: coinDiscount,
            platform_fee: platformFee,
            payout_to_host: basePrice, // <--- ADDS PAYOUT AMOUNT
            payout_status: 'pending_payment',
            billing_options: 'autoPay'
        };
    } 
    // --- ONE TIME ---
    else {
        const platformFee = basePrice * commissionRate;
        const convenienceFee = basePrice * 0.10;
        const subtotal = basePrice + platformFee + convenienceFee;
        const tax = subtotal * GST_RATE;
        const finalAmount = Math.max(subtotal + tax - coinDiscount, 1);
        const finalAmountPaise = Math.round(finalAmount * 100);

        const order = await razorpay.orders.create({
            amount: finalAmountPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: { listing_id, user_id, booking_id, type: 'oneTime' }
        });

        responsePayload = {
            ...order,
            is_subscription: false,
            key: Deno.env.get("RAZORPAY_KEY_ID")
        };

        transactionRecord = {
            booking_id: booking_id || null, // <--- SAVES THE BOOKING ID
            buyer_id: user_id,
            gateway_transaction_id: order.id,
            original_amount: subtotal.toFixed(2),
            final_amount_charged: finalAmount,
            credits_used: coinDiscount,
            platform_fee: platformFee,
            payout_to_host: basePrice, // <--- ADDS PAYOUT AMOUNT
            payout_status: 'pending_payment',
            billing_options: 'oneTime'
        };
    }

    // Insert Transaction
    const { error: txError } = await supabaseAdmin
        .from('transactions')
        .insert(transactionRecord);

    if (txError) {
        console.error("DB Insert Error:", txError);
    }

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});