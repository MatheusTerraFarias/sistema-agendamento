import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jjsgpttjqtdysdetouqv.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqc2dwdHRqcXRkeXNkZXRvdXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTAzNTIsImV4cCI6MjA5NTk2NjM1Mn0.jsZu2QZA1_Xk1fhJsWtm5A6NeKDGMnTQrI6KaoqvKr4'

let supabaseRequestCount = 0

const debugFetch = async (url, options) => {
  supabaseRequestCount += 1
  const requestId = supabaseRequestCount
  console.debug(`%c[Supabase][${requestId}]`, 'color: #22c55e; font-weight: bold;', options?.method || 'GET', url)
  if (options?.body) {
    console.debug(`%c[Supabase][${requestId}] body:`, 'color: #38bdf8;', options.body)
  }

  const response = await fetch(url, options)
  console.debug(`%c[Supabase][${requestId}] response:`, 'color: #fbbf24;', response.status, response.statusText, url)
  return response
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    fetch: debugFetch,
  }
)
