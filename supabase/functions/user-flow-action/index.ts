import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts' // Uses your shared CORS file

console.log('Loaded user-flow-action function')

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking_id, node_id } = await req.json()

    // 1. Create a Supabase client with auth privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Get the *current* user's ID from their auth token
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    const actor_id = user.id

    // 3. Get the flow node details from the "brain"
    const { data: node, error: nodeError } = await supabaseAdmin
      .from('flow_nodes')
      .select('message_to_send, action_on_click')
      .eq('node_id', node_id)
      .single()

    if (nodeError) throw new Error(`Node not found: ${node_id}`)

    // 4. Log this action to the chat history
    const { error: logError } = await supabaseAdmin
      .from('communication_log')
      .insert({
        booking_id: booking_id,
        actor_id: actor_id,
        message_sent: node.message_to_send,
      })

    if (logError) throw new Error(`Failed to write to log: ${logError.message}`)

    // 5. Update the booking's current state
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ current_flow_node_id: node_id })
      .eq('id', booking_id)

    if (updateError) throw new Error(`Failed to update booking state: ${updateError.message}`)

    // TODO: If node.action_on_click === 'TRIGGER_HOST_FORM',
    // send a notification to the host.

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