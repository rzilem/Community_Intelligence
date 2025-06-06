
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cahergndkwfqltxyikyr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhaGVyZ25ka3dmcWx0eHlpa3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTUzMTYsImV4cCI6MjA1OTY3MTMxNn0.n_tRSJy3M9IaiyrhG02kpvko-pWd6XyYs4khDauxRGQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
