import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = 'https://vwgvqmysqpibkocnwihq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Z3ZxbXlzcXBpYmtvY253aWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTU3NTMsImV4cCI6MjA4ODM3MTc1M30.U-fACu5kFfoPH-cnqGhpNyiDWPUENfGX5mSfPXApX-0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
