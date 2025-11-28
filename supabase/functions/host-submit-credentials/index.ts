import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

console.log("Host Submit Credentials Function Loaded");

serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { booking_id, host_id, credential_data, message_content } = await req.json();

    // 2. Validate Inputs
    if (!booking_id || !host_id || !credential_data) {
      throw new Error("Missing required fields: booking_id, host_id, or credential_data");
    }

    // 3. Init Admin Client (Service Role to bypass RLS for logging)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log("Inserting secure credential for booking:", booking_id);

    // 4. Insert Credential AND Select the ID (Crucial Step!)
    const { data: credData, error: credError } = await supabaseAdmin
      .from('secure_credentials')
      .insert({
        booking_id,
        host_id,
        credential_data: typeof credential_data === 'string' ? JSON.parse(credential_data) : credential_data,
        status: 'SENT'
      })
      .select('id') // <--- THIS WAS LIKELY MISSING OR NOT RETURNING
      .single();

    if (credError) {
      console.error("Credential Insert Error:", credError);
      throw credError;
    }

    if (!credData || !credData.id) {
      throw new Error("Failed to retrieve new credential ID.");
    }

    console.log("Credential created. ID:", credData.id);

    // 5. Create Communication Log Entry (Linking the Credential)
    const { error: logError } = await supabaseAdmin
      .from('communication_log')
      .insert({
        booking_id,
        actor_id: host_id,
        message_sent: message_content || "Secure credentials shared",
        secure_credential_id: credData.id // Link the ID we just got
      });

    if (logError) {
      console.error("Log Insert Error:", logError);
      // We don't throw here to avoid failing the whole request if just the log fails,
      // but we log it for debugging.
    }

    // 6. Return Success
    return new Response(JSON.stringify({ success: true, id: credData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500, // Return 500 so frontend knows it failed
    });
  }
});