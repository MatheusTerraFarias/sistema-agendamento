import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Configure them in .env or your environment.')
}

let supabaseRequestCount = 0

const debugFetch = async (url, options) => {
  supabaseRequestCount += 1
  const requestId = supabaseRequestCount
  console.debug(`%c[Supabase][${requestId}]`, 'color: #22c55e; font-weight: bold;', options?.method || 'GET', url)
  if (options?.body) {
    console.debug(`%c[Supabase][${requestId}] body:`, 'color: #38bdf8;', options.body)
  }

  try {
    const response = await fetch(url, options)
    console.debug(`%c[Supabase][${requestId}] response:`, 'color: #fbbf24;', response.status, response.statusText, url)
    return response
  } catch (err) {
    console.error(`%c[Supabase][${requestId}] fetch error:`, 'color: #ef4444;', err.message, url)
    throw err
  }
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    fetch: import.meta.env.DEV ? debugFetch : fetch,
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
