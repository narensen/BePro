
import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export { supabaseKey }
export const supabase = createClient(supabaseUrl, supabaseKey)