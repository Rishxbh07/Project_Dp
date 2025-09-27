// supabase/functions/process-ops-queue/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record: job } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // --- Main Worker Logic ---
    if (job.op_type === 'listing.created') {
      const {
        host_id,
        service_id,
        seats_total,
        seats_available,
        plan_purchased_date
      } = job.payload;

      // 1. PERFORM THE ACTUAL INSERT INTO THE LISTINGS TABLE
      const { error: insertError } = await supabaseAdmin
        .from('listings')
        .insert({
          host_id,
          service_id,
          seats_total,
          seats_available,
          plan_purchased_date,
          status: 'active'
        });

      if (insertError) {
        throw new Error(`Failed to insert listing: ${insertError.message}`);
      }

      // 2. Mark the job as processed
      const { error: updateError } = await supabaseAdmin
        .from('ops_queue')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', job.id)

      if (updateError) {
        // This won't stop the user, but it's important for you to know
        console.error(`Failed to update ops_queue job ${job.id}: ${updateError.message}`);
      }
      
      console.log(`Successfully processed listing.created job: ${job.id}`);
    }

    return new Response(JSON.stringify({ message: `Job ${job.id} processed.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // If something fails, log the error in the ops_queue table for debugging
     const { record: job } = await req.json()
     const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    await supabaseAdmin
        .from('ops_queue')
        .update({ last_error: error.message })
        .eq('id', job.id)

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})