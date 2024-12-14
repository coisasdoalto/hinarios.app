import { createClient } from '@supabase/supabase-js';

import { Database } from './database.types';

export const SUPABASE_PROJECT_ID = 'tldfezkopcqqowoucbdo';

const supabaseUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZGZlemtvcGNxcW93b3VjYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk0NDY3ODcsImV4cCI6MjAzNTAyMjc4N30.p4PtTNvzZNdpDrqeRzuYX9ye8YS3_Xks1b4nRDg054c';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
