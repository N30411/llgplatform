

import { createClient } from '@supabase/supabase-js';

// Read from Netlify/Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Console log for deployment debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseKey);

if (!supabaseUrl || !supabaseKey) {
	console.error('Supabase environment variables are missing!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
