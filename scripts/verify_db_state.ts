
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
    console.log('--- Database Verification ---');

    const counts: Record<string, number> = {};
    const tables = ['users', 'commissioners', 'developers', 'clients', 'projects', 'messages', 'escrow_ledger', 'leads'];

    for (const t of tables) {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        if (error) console.error(`Error counting ${t}:`, error.message);
        else counts[t] = count || 0;
    }

    console.log('Table Counts:', counts);

    // Verify Developer - User Link
    console.log('\n--- Verifying Developers ---');
    const { data: devs } = await supabase.from('developers').select('id, user_id, kyc_status');
    if (devs && devs.length > 0) {
        for (const d of devs) {
            const { data: u } = await supabase.from('users').select('email, role').eq('id', d.user_id).single();
            console.log(`Dev ${d.id} -> User ${u?.email} (${u?.role}) - KYC: ${d.kyc_status}`);
        }
    } else {
        console.error('NO DEVELOPERS FOUND!');
    }

    // Verify Admin Exists
    console.log('\n--- Verifying Admins ---');
    const { data: admins } = await supabase.from('users').select('email, role, password_hash').eq('role', 'admin');
    console.log('Admins found:', admins?.map(a => ({ ...a, password_hash: a.password_hash ? 'Present' : 'MISSING' })));

    // Verify Milestones Schema Support (Checklist)
    console.log('\n--- Verifying Milestones Schema ---');
    if (counts['projects'] > 0) {
        const { data: p } = await supabase.from('projects').select('id').limit(1).single();
        if (p) {
            const { error: mError } = await supabase.from('project_milestones').insert({
                project_id: p.id,
                title: 'Test Milestone',
                description: 'Verifying Columns',
                percent_amount: 10,
                status: 'pending',
                checklist: [{ id: 1, text: 'Test Item', completed: false }],
                progress: 0
            });
            if (mError) {
                console.error('Milestone Validation Failed:', mError.message);
                if (mError.message.includes('checklist')) console.error('HINT: checklist column missing');
                if (mError.message.includes('progress')) console.error('HINT: progress column missing');
            } else {
                console.log('Milestone with Checklist & Progress inserted successfully!');
            }
        }
    }

}

verify().catch(console.error);
