import { createBrowserClient } from '@supabase/ssr';

export const createSupabaseBrowserClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    );
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey);

  // Listen for auth errors and clear invalid tokens
  client.auth.onAuthStateChange(event => {
    if (event === 'TOKEN_REFRESHED') {
      // Auth token refreshed
    } else if (event === 'SIGNED_OUT') {
      // User signed out
    }
  });

  return client;
};

// For backward compatibility - create client lazily to avoid immediate errors
let _supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export const supabase = new Proxy(
  {} as ReturnType<typeof createBrowserClient>,
  {
    get(target, prop) {
      if (!_supabaseClient) {
        _supabaseClient = createSupabaseBrowserClient();
      }
      return (_supabaseClient as Record<string, unknown>)[prop as string];
    },
  }
);
