import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function isPlaceholderUrl(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return !normalized || normalized.includes('your-project.supabase.co') || normalized.includes('your-project.supabase') || normalized.includes('your-project') || normalized.includes('supabase.co') && normalized.includes('your-project') || normalized.includes('your-project.supabas') || normalized.includes('your-project.supabase');
}

function isPlaceholderKey(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return !normalized || normalized.includes('your-anon-public-key') || normalized.includes('your_anon_key') || normalized.includes('anon_key') || normalized.includes('anon');
}

const supabaseConfigIssue = (() => {
  if (!supabaseUrl) return 'VITE_SUPABASE_URL is not configured.'
  if (!supabaseKey) return 'VITE_SUPABASE_ANON_KEY is not configured.'
  if (isPlaceholderUrl(supabaseUrl)) return 'VITE_SUPABASE_URL appears to be a placeholder. Replace it with your actual Supabase project URL.'
  if (isPlaceholderKey(supabaseKey)) return 'VITE_SUPABASE_ANON_KEY appears to be a placeholder. Replace it with your actual Supabase anon key.'
  return null
})()

const supabaseConfigured = supabaseConfigIssue === null

if (!supabaseConfigured) {
  console.error('Supabase configuration issue:', supabaseConfigIssue)
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

let supabase = null
if (supabaseConfigured) {
  supabase = createClient(
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
} else {
  // Export a proxy that throws a helpful error when used, instead of failing at import-time
  supabase = new Proxy({}, {
    get() {
      throw new Error(`Supabase client is not configured. ${supabaseConfigIssue}`)
    },
    apply() {
      throw new Error(`Supabase client is not configured. ${supabaseConfigIssue}`)
    }
  })
}

export { supabase, supabaseConfigured, supabaseConfigIssue }
