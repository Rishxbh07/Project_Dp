import { createClient } from '@supabase/supabase-js'

// Read the variables from Vite's special import.meta.env object
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)