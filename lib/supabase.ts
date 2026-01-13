
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qkllvcqolnpwwzlbpimi.supabase.co/';
const supabaseAnonKey = 'sb_publishable_i8CEIX4-9FloStPgjag3XQ_rLweiG03';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
