import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Loaded expire-credentials function')

Deno.serve(async () => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find all "SEEN" credentials where the expiry time is in the past
    const { data, error } = await supabaseAdmin
      .from('secure_credentials')
      .update({ status: 'EXPIRED' })
      .eq('status', 'SEEN')
      .lt('expires_at', new Date().toISOString()) // lt = less than
      .select('id')

    if (error) throw error

    const count = data ? data.length : 0
    console.log(`Successfully expired ${count} credentials.`)

    return new Response(JSON.stringify({ success: true, expired_count: count }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})