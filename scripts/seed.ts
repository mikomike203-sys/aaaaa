
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const USERS = [
    { email: 'admin1@nexus.com', password: 'password123', role: 'admin', name: 'Admin Alpha' },
    { email: 'admin2@nexus.com', password: 'password123', role: 'admin', name: 'Admin Beta' },
    // active commissioners
    { email: 'comm1@nexus.com', password: 'password123', role: 'commissioner', name: 'Comm Sarah', metadata: { location: 'Nairobi', niche: 'E-commerce' }, status: 'approved' },
    { email: 'comm2@nexus.com', password: 'password123', role: 'commissioner', name: 'Comm David', metadata: { location: 'Lagos', niche: 'Fintech' }, status: 'approved' },
    // pending commissioners
    { email: 'comm_pending1@nexus.com', password: 'password123', role: 'commissioner', name: 'Pending Comm John', metadata: { location: 'Mombasa', niche: 'Real Estate' }, status: 'pending', bio: 'Experienced realtor looking to digitalize.' },

    // active developers
    { email: 'dev1@nexus.com', password: 'password123', role: 'developer', name: 'Dev John', metadata: { stack: ['React', 'Node.js'], hourly_rate: 40 }, status: 'approved' },
    { email: 'dev2@nexus.com', password: 'password123', role: 'developer', name: 'Dev Jane', metadata: { stack: ['Python', 'Django'], hourly_rate: 55 }, status: 'approved' },
    // pending developers
    { email: 'dev_pending1@nexus.com', password: 'password123', role: 'developer', name: 'Pending Dev Alex', metadata: { stack: ['Vue', 'Laravel'], hourly_rate: 35 }, status: 'pending', portfolio: 'https://github.com/alex' },

    { email: 'client1@nexus.com', password: 'password123', role: 'client', name: 'Client Corp A', metadata: { company: 'Corp A', industry: 'Retail' } },
    { email: 'client2@nexus.com', password: 'password123', role: 'client', name: 'Client Startup B', metadata: { company: 'Startup B', industry: 'Tech' } },
];

async function seed() {
    console.log('🌱 Starting Seed Process...');

    const userMap: Record<string, string> = {}; // email -> uuid

    // 1. Create Users
    for (const u of USERS) {
        console.log(`Creating user: ${u.email}...`);

        // Remove if exists (optional, mostly for re-running)
        // Note: DeleteUser isn't exposed easily via admin API searching by email without listing all. 
        // We'll try to create, if catch error saying email exists, we just fetch the ID.

        let userId = '';

        // Try to get user by email first (custom helper logic usually needed, but admin.listUsers works)
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData.users.find(x => x.email === u.email);

        if (existing) {
            console.log(`  User exists (${existing.id}), resetting password...`);
            await supabase.auth.admin.updateUserById(existing.id, { password: u.password });
            userId = existing.id;
        } else {
            const { data, error } = await supabase.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: { role: u.role, name: u.name }
            });
            if (error) {
                console.error(`  Error creating ${u.email}:`, error.message);
                continue;
            }
            userId = data.user.id;
            console.log(`  Created ${userId}`);
        }

        userMap[u.email] = userId;

        // 2. Insert into public.users (upsert)
        await supabase.from('users').upsert({
            id: userId,
            email: u.email,
            name: u.name,
            role: u.role,
            password_hash: crypto.createHash('sha256').update(u.password).digest('hex'),
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name.replace(' ', '')}`,
            verified: u.status !== 'pending', // Only verify if not pending
        });

        // 3. Create Role Specific Profiles
        const upsertProfile = async (table: string, data: any, uniqueKey: string = 'user_id') => {
            const { data: existing } = await supabase.from(table).select('id').eq(uniqueKey, data[uniqueKey]).single();
            if (existing) {
                await supabase.from(table).update(data).eq('id', existing.id);
            } else {
                await supabase.from(table).insert(data);
            }
        };

        if (u.role === 'commissioner') {
            await upsertProfile('commissioners', {
                user_id: userId,
                referral_code: `REF-${u.name.split(' ')[1].toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
                kyc_status: u.status as any,
            });
        } else if (u.role === 'developer') {
            await upsertProfile('developers', {
                user_id: userId,
                hourly_rate: u.metadata?.hourly_rate,
                roles: u.metadata?.stack || [],
                kyc_status: u.status as any,
                portfolio_links: u['portfolio'] ? [u['portfolio']] : [],
            });
        } else if (u.role === 'client') {
            await upsertProfile('clients', {
                user_id: userId,
                company_name: u.metadata?.company,
                contact_person: u.name
            });
        }
    }

    // 4. Create Mock Data leveraging the User IDs
    // We need the profile IDs (commissioner_id, developer_id, etc), not just user_ids
    const getProfileId = async (table: string, email: string) => {
        const uid = userMap[email];
        const { data } = await supabase.from(table).select('id').eq('user_id', uid).single();
        return data?.id;
    };

    const comm1Id = await getProfileId('commissioners', 'comm1@nexus.com');
    const comm2Id = await getProfileId('commissioners', 'comm2@nexus.com');
    const dev1Id = await getProfileId('developers', 'dev1@nexus.com');
    const dev2Id = await getProfileId('developers', 'dev2@nexus.com');
    const client1Id = await getProfileId('clients', 'client1@nexus.com');
    const client2Id = await getProfileId('clients', 'client2@nexus.com');

    console.log('IDs found:', { comm1Id, comm2Id, dev1Id, client1Id });

    console.log('Creating Leads...');
    // Lead 1: Unclaimed (Public)
    await supabase.from('leads').upsert({
        client_name: 'Unknown Lead',
        client_email: 'unknown@example.com',
        project_title: 'Mystery App',
        budget: 50000,
        status: 'created'
    }, { onConflict: 'client_email' });

    // Lead 2: Claimed by Comm 1
    if (comm1Id) {
        await supabase.from('leads').upsert({
            client_name: 'Claimed Client',
            client_email: 'claimed@example.com',
            project_title: 'Website Redesign',
            budget: 120000,
            commissioner_id: comm1Id,
            claimed_by: comm1Id,
            claimed_at: new Date(),
            status: 'claimed'
        }, { onConflict: 'client_email' });
    }

    console.log('Creating Projects & Financials...');

    // Project 1: Active (Client 1 + Comm 1 + Dev 1)
    if (client1Id && comm1Id && dev1Id) {
        console.log('Creating Project 1...');

        let p1;
        const { data: existingP1 } = await supabase.from('projects').select('*').eq('title', 'Nexus E-commerce').single();
        if (existingP1) {
            p1 = existingP1;
        } else {
            const { data: newP1, error: p1Error } = await supabase.from('projects').insert({
                title: 'Nexus E-commerce',
                description: 'Building the next gen e-com platform',
                total_value: 500000, // Schema 001 uses total_value not budget
                status: 'active',
                client_id: client1Id,
                commissioner_id: comm1Id,
                developer_id: dev1Id
            }).select().single();
            if (p1Error) console.error('Error creating Project 1:', p1Error.message);
            p1 = newP1;
        }

        if (p1) {
            console.log('Project 1 Created:', p1.id);
            // Messages
            await supabase.from('messages').insert([
                { project_id: p1.id, sender_id: userMap['comm1@nexus.com'], content: 'Hey team, let\'s kick this off!' },
                { project_id: p1.id, sender_id: userMap['dev1@nexus.com'], content: 'Ready when you are.' }
            ]);

            // Ledger Entries (Incoming Payment)
            await supabase.from('escrow_ledger').insert([
                {
                    project_id: p1.id,
                    amount: 500000,
                    transaction_type: 'deposit',
                    description: 'Initial Escrow Deposit',
                    balance_after: 500000,
                    status: 'completed'
                },
                {
                    // Outgoing milestone payment (example)
                    project_id: p1.id,
                    amount: -50000,
                    transaction_type: 'payment',
                    description: 'Milestone 1 Release',
                    balance_after: 450000,
                    status: 'completed'
                }
            ]);

            // Payment Verification Record
            await supabase.from('payments').insert({
                project_id: p1.id,
                payer_id: userMap['client1@nexus.com'], // Using User ID for payer
                amount: 500000,
                status: 'verified',
                payment_method: 'bank_transfer',
                payment_reference: 'REF-123456'
            });
        }
    } else {
        console.log('Skipping Project 1 creation due to missing IDs');
    }

    // Project 2: Pending (Client 2 + Comm 2) - Pending Deposit
    if (client2Id && comm2Id) {
        const { data: p2 } = await supabase.from('projects').upsert({
            title: 'Mobile App Beta',
            description: 'MVP for the new mobile app',
            budget: 250000,
            status: 'pending',
            client_id: client2Id,
            commissioner_id: comm2Id
            // No developer yet
        }, { onConflict: 'title' }).select().single();

        if (p2) {
            await supabase.from('payments').insert({
                project_id: p2.id,
                payer_id: userMap['client2@nexus.com'],
                amount: 100000, // Partial deposit
                status: 'pending_verification',
                payment_method: 'mpesa',
                payment_reference: 'MPESA-XYZ'
            });
        }
    }

    console.log('✅ Seeding Complete!');
}

seed().catch(err => console.error(err));
