
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
    console.log('--- Testing Chat Permissions ---');

    // 1. Get a project and a participant (e.g. Commissioner)
    // We'll use the service client to find valid IDs
    const { data: project, error: projError } = await serviceClient.from('projects').select('*').limit(1).single();
    if (projError) {
        console.error('Project Fetch Error:', projError);
        return;
    }
    if (!project) {
        console.error('No projects found to test with.');
        return;
    }
    console.log(`Testing with Project: ${project.title} (${project.id})`);

    const { data: comm } = await serviceClient.from('commissioners').select('user_id').eq('id', project.commissioner_id).single();
    if (!comm) {
        console.error('Commissioner not found');
        return;
    }
    console.log(`Commissioner User ID: ${comm.user_id}`);

    // 2. Try to fetch messages as Anon (should fail or return empty if no RLS/Auth)
    // NOTE: In a real app, anonClient would be authenticated with `signInWithPassword`. 
    // We need to sign in to test RLS properly.

    console.log('Signing in as Commissioner...');
    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
        email: 'comm1@nexus.com', // Assuming this user corresponds to comm.user_id from seed
        password: 'password123'
    });

    if (authError) {
        console.error('Login failed:', authError.message);
        return;
    }
    console.log('Logged in!');

    // 3. Try INSERT
    console.log('Attempting INSERT...');
    const { data: insertData, error: insertError } = await anonClient
        .from('messages')
        .insert({
            project_id: project.id,
            sender_id: authData.user.id,
            content: 'Test message from script'
        })
        .select();

    if (insertError) {
        console.error('INSERT Blocked/Failed:', insertError);
    } else {
        console.log('INSERT Success:', insertData);
    }

    // 4. Try SELECT
    console.log('Attempting SELECT...');
    const { data: selectData, error: selectError } = await anonClient
        .from('messages')
        .select('*')
        .eq('project_id', project.id);

    if (selectError) {
        console.error('SELECT Blocked/Failed:', selectError);
    } else {
        console.log(`SELECT Success: Found ${selectData.length} messages`);
    }
}

test();
