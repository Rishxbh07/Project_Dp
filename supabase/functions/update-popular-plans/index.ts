import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // This is needed to invoke the function from a browser or third-party service
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a special "Admin" Supabase client that can bypass RLS
    // IMPORTANT: Set these in your project's Environment Variables
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get the top 10 listings by average rating
    const { data: topListings, error: selectError } = await supabaseAdmin
      .from('listings')
      .select(`
        id,
        average_rating,
        services ( name, base_price )
      `)
      .eq('status', 'active')
      .order('average_rating', { ascending: false })
      .limit(10);

    if (selectError) throw selectError;
    
    // 2. Format the data for the popular_plans table
    const popularPlansData = topListings.map(listing => ({
      listing_id: listing.id,
      service_name: listing.services.name,
      base_price: listing.services.base_price,
      average_rating: listing.average_rating,
    }));

    // 3. Clear the existing popular_plans table
    const { error: deleteError } = await supabaseAdmin
      .from('popular_plans')
      .delete()
      .neq('listing_id', '00000000-0000-0000-0000-000000000000'); // Deletes all rows

    if (deleteError) throw deleteError;

    // 4. Insert the new popular plans
    const { error: insertError } = await supabaseAdmin
      .from('popular_plans')
      .insert(popularPlansData);

    if (insertError) throw insertError;

    // Return a success message
    return new Response(JSON.stringify({ message: "Popular plans updated successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Return an error message
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});