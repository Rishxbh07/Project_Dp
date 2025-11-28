import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Razorpay from "https://esm.sh/razorpay@latest";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Create-order function (Optimized) loaded!");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { listing_id, user_id, payment_option, use_coins } = await req.json();

    if (!listing_id || !user_id) throw new Error("Missing parameters");

    // Initialize Admin Client (Service Role) to read/write sensitive data
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
    );

    // 1. Fetch Listing & Service
    const { data: listing, error: dbError } = await supabaseAdmin
      .from('listings')
      .select('*, service:services(*)')
      .eq('id', listing_id)
      .single();

    if (dbError || !listing) throw new Error("Listing not found");

    // 2. Wallet & Coin Logic
    let coinDiscount = 0;
    if (use_coins) {
        const { data: wallet } = await supabaseAdmin
            .from('credit_wallets')
            .select('credit_balance')
            .eq('user_id', user_id)
            .single();
        
        // Check if balance allows
        if (wallet && wallet.credit_balance >= 10) coinDiscount = 10;
    }

    const razorpay = new Razorpay({
      key_id: Deno.env.get("RAZORPAY_KEY_ID")!,
      key_secret: Deno.env.get("RAZORPAY_KEY_SECRET")!,
    });

    const basePrice = Number(listing.service.base_price);
    const commissionRate = Number(listing.service.platform_commission_rate) / 100;
    const GST_RATE = 0.18; // Standard 18% GST

    let responsePayload = {};
    let transactionRecord = {};

    // --- PATH A: AUTO PAY (Subscription) ---
    if (payment_option === 'autoPay') {
        // A. Recurring Amounts (Base Price + 18% GST)
        const recurringBase = basePrice;
        const recurringTax = recurringBase * GST_RATE;
        const recurringTotalPaise = Math.round((recurringBase + recurringTax) * 100);

        // B. Upfront Amounts (Platform Fee + 18% GST - Discount)
        const platformFee = basePrice * commissionRate;
        const upfrontTax = platformFee * GST_RATE;
        // Ensure non-negative
        const upfrontTotal = Math.max((platformFee + upfrontTax) - coinDiscount, 1);
        const upfrontTotalPaise = Math.round(upfrontTotal * 100);

        // C. Plan Management (Fix: Reuse Plans)
        let planId = listing.service.razorpay_plan_id;

        // If no plan exists for this service, create one and save it
        if (!planId) {
            console.log("Creating new Razorpay Plan for Service:", listing.service.name);
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

            // Save back to DB so we don't create it next time
            await supabaseAdmin
                .from('services')
                .update({ razorpay_plan_id: planId })
                .eq('id', listing.service.id);
        }

        // D. Create Subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            total_count: 120, // 10 years
            quantity: 1,
            customer_notify: 1,
            notes: { listing_id, user_id, type: 'autoPay' },
            addons: [{
                item: {
                    name: "DapBuddy Shield (Joining Fee)",
                    amount: upfrontTotalPaise,
                    currency: "INR"
                }
            }]
        });

        // Prepare Response (FIXED: Added 'id' property)
        responsePayload = {
            id: subscription.id, // <--- THIS WAS MISSING
            is_subscription: true,
            subscription_id: subscription.id,
            plan_id: planId,
            recurring_amount: recurringTotalPaise,
            upfront_amount: upfrontTotalPaise,
            currency: "INR",
            key: Deno.env.get("RAZORPAY_KEY_ID") 
        };

        // Prepare Transaction Record
        transactionRecord = {
            booking_id: null,
            buyer_id: user_id,
            gateway_transaction_id: subscription.id,
            original_amount: (recurringBase + platformFee).toFixed(2),
            final_amount_charged: (recurringTotalPaise + upfrontTotalPaise) / 100,
            credits_used: coinDiscount,
            platform_fee: platformFee,
            payout_status: 'pending_payment',
            billing_options: 'autoPay'
        };
    } 
    
    // --- PATH B: ONE TIME (Order) ---
    else {
        const platformFee = basePrice * commissionRate;
        const convenienceFee = basePrice * 0.10; // Extra 10%

        const subtotal = basePrice + platformFee + convenienceFee;
        const tax = subtotal * GST_RATE;
        const finalAmount = Math.max(subtotal + tax - coinDiscount, 1);
        const finalAmountPaise = Math.round(finalAmount * 100);

        const order = await razorpay.orders.create({
            amount: finalAmountPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now().toString().slice(-4)}`,
            notes: { listing_id, user_id, type: 'oneTime' }
        });

        responsePayload = {
            ...order,
            is_subscription: false,
            server_calculated_total: finalAmount.toFixed(2),
            key: Deno.env.get("RAZORPAY_KEY_ID")
        };

        transactionRecord = {
            booking_id: null,
            buyer_id: user_id,
            gateway_transaction_id: order.id,
            original_amount: subtotal.toFixed(2),
            final_amount_charged: finalAmount,
            credits_used: coinDiscount,
            platform_fee: platformFee,
            payout_status: 'pending_payment',
            billing_options: 'oneTime'
        };
    }

    // 3. Persistence
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