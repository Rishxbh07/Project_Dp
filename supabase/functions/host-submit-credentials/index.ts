import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Loaded host-submit-credentials function')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking_id, form_key, form_data } = await req.json()

    // 1. Create Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Get Host's ID from auth
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    const host_id = user.id

    // TODO: Add validation logic here
    // 1. Fetch 'host_form_definitions' where form_key matches
    // 2. Validate 'form_data' against the 'form_definition' JSON

    // 3. Save the "free text" to the secure table
    const { data: cred, error: credError } = await supabaseAdmin
      .from('secure_credentials')
      .insert({
        booking_id: booking_id,
        host_id: host_id,
        credential_data: form_data, // This is the encrypted free text
        status: 'SENT',
      })
      .select('id')
      .single()

    if (credError) throw new Error(`Failed to save credentials: ${credError.message}`)
    const secure_credential_id = cred.id

    // 4. Log this action to the chat history
    const { error: logError } = await supabaseAdmin
      .from('communication_log')
      .insert({
        booking_id: booking_id,
        actor_id: host_id,
        message_sent: 'Host has sent the details. Please check and confirm.',
        secure_credential_id: secure_credential_id, // Link to the secure data
      })

    if (logError) throw new Error(`Failed to write to log: ${logError.message}`)

    // 5. Update the booking state to show the "Thank you" / "Wrong details" buttons
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ current_flow_node_id: 'USER_CONFIRM_ACCESS' }) // This node is the parent for confirm/deny buttons
      .eq('id', booking_id)

    if (updateError) throw new Error(`Failed to update booking state: ${updateError.message}`)

    // TODO: Send a notification to the user.

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})