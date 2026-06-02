import {createClient} from '@supabase/supabase-js'

const supabaseUrl = 'https://jjsgpttjqtdysdetouqv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqc2dwdHRqcXRkeXNkZXRvdXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTAzNTIsImV4cCI6MjA5NTk2NjM1Mn0.jsZu2QZA1_Xk1fhJsWtm5A6NeKDGMnTQrI6KaoqvKr4'

export const supabase = createClient(
    supabaseUrl, 
    supabaseKey
)