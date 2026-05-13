import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables in backend.');
}

export const supabase = createClient(
  supabaseUrl || 'https://hwwmoqtczyqxtfbfpvsi.supabase.co', 
  supabaseAnonKey || ''
);
