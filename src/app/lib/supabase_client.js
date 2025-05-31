
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://xljnvfsjdrmujixtapby.supabase.co'
export const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsam52ZnNqZHJtdWppeHRhcGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MDY5MDcsImV4cCI6MjA2NDE4MjkwN30.b4bW20awF7GD15AjMkELnEXF6e0e-wZTDfAHgsC0m-c"
console.log(supabaseKey)
export const supabase = createClient(supabaseUrl, supabaseKey)