
import { createClient } from '@supabase/supabase-js';

// Access environment variables. 
// Note: In Vite, use import.meta.env.VITE_SUPABASE_URL
// In CRA/Webpack, use process.env.REACT_APP_SUPABASE_URL
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
