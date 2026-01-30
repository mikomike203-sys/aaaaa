import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { leadId } = await req.json();
        if (!leadId) return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });

        // 1. Fetch lead details
        const { data: lead, error: leadError } = await supabaseAdmin
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .single();

        if (leadError || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        if (lead.status === 'active') return NextResponse.json({ error: 'Lead already converted' }, { status: 400 });

        // 2. Ensure User account exists for the client
        let userId;
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', lead.client_email)
            .single();

        if (existingUser) {
            userId = existingUser.id;
        } else {
            // Create user
            const { data: newUser, error: userError } = await supabaseAdmin
                .from('users')
                .insert({
                    email: lead.client_email,
                    name: lead.client_name,
                    phone: lead.client_phone,
                    role: 'client',
                    status: 'active'
                })
                .select('id')
                .single();

            if (userError) throw userError;
            userId = newUser.id;

            // Create client profile
            await supabaseAdmin.from('clients').insert({
                user_id: userId,
                company_name: lead.client_name // Fallback
            });
        }

        // Get actual client profile ID
        const { data: client } = await supabaseAdmin
            .from('clients')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!client) throw new Error('Client profile not found');

        // 3. Create Project
        const { data: project, error: projectError } = await supabaseAdmin
            .from('projects')
            .insert({
                title: `Converted: ${lead.client_name} Project`,
                description: lead.project_summary,
                client_id: client.id,
                commissioner_id: lead.commissioner_id,
                total_value: lead.budget,
                currency: 'KES',
                status: 'deposit_pending',
                escrow_status: 'no_deposit'
            })
            .select('id')
            .single();

        if (projectError) throw projectError;

        // 4. Create Standard Milestones (43% Deposit, 57% Final)
        const milestones = [
            {
                project_id: project.id,
                title: 'Initial Deposit (43%)',
                percent_amount: 43,
                status: 'pending'
            },
            {
                project_id: project.id,
                title: 'Project Delivery & Acceptance',
                percent_amount: 57,
                status: 'pending'
            }
        ];

        const { error: milestoneError } = await supabaseAdmin
            .from('project_milestones')
            .insert(milestones);

        if (milestoneError) throw milestoneError;

        // 5. Update Lead status
        await supabaseAdmin
            .from('leads')
            .update({
                status: 'active',
                converted_project_id: project.id
            })
            .eq('id', leadId);

        return NextResponse.json({
            success: true,
            projectId: project.id,
            message: 'Lead successfully converted to project'
        });

    } catch (error: any) {
        console.error('Lead conversion error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
