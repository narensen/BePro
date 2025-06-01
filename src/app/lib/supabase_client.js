
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://syetgksogdvelpfbrfgx.supabase.co'
export const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5ZXRna3NvZ2R2ZWxwZmJyZmd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MDg0MTYsImV4cCI6MjA2NDM4NDQxNn0.ikC2WD2Bb8FgnoptnEq5aABGVM_7mNcAXfHF6QX8U9E"
console.log(supabaseKey)
export const supabase = createClient(supabaseUrl, supabaseKey)