
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    console.log('Checking for messages table...');
    const { data, error } = await supabase.from('messages').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Error (Table likely missing):', error.message);
    } else {
        console.log('Table exists! Count:', data); // data is null for head:true usually, count is in count
    }
}

check();
