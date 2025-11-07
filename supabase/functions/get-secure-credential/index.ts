import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Loaded get-secure-credential function')

// Set your expiry time in hours
const EXPIRY_HOURS = 24

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { secure_credential_id } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the current user
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    // 1. Get the credential
    let { data: credential, error: fetchError } = await supabaseAdmin
      .from('secure_credentials')
      .select('*, bookings(buyer_id)') // Join bookings to check if user is the buyer
      .eq('id', secure_credential_id)
      .single()

    if (fetchError) throw new Error('Credential not found.')
    
    // 2. Security Check: Is this user the buyer for this credential?
    if (credential.bookings.buyer_id !== user.id) {
       return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders })
    }

    // 3. Expiry Logic
    if (credential.status === 'EXPIRED') {
      return new Response(JSON.stringify({ error: 'These credentials have expired.' }), { status: 410, headers: corsHeaders })
    }

    // This is the *first time* the user is seeing it.
    // Start the 24-hour countdown.
    if (credential.status === 'SENT') {
      const seenAt = new Date()
      const expiresAt = new Date(seenAt.getTime() + EXPIRY_HOURS * 60 * 60 * 1000)

      const { data: updatedCred, error: updateError } = await supabaseAdmin
        .from('secure_credentials')
        .update({
          status: 'SEEN',
          seen_at: seenAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', secure_credential_id)
        .select() // Return the updated row
        .single()
      
      if (updateError) throw new Error('Failed to update credential status.')
      credential = updatedCred // Use the updated data
    }
    
    // 4. Return the (now-safe) credential data
    return new Response(JSON.stringify({ credential }), {
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