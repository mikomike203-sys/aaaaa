// API Route: Create Lead & Fetch Public Leads
// Leads are simple contact inquiries (like messages) - no intake links
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        let { commissioner_id, user_id, client_name, client_phone, client_email, project_summary, budget } = body;

        // Smart Lookup: If no commissioner_id, try to find it via user_id
        if (!commissioner_id && user_id) {
            const { data: comm } = await supabaseAdmin
                .from('commissioners')
                .select('id')
                .eq('user_id', user_id)
                .single();

            if (comm) {
                commissioner_id = comm.id;
            }
        }

        // Validate required fields
        if (!client_name) {
            return NextResponse.json(
                { error: 'Client name is required' },
                { status: 400 }
            );
        }

        // If no commissioner_id, it goes to the Open Pool
        const isPublicPool = !commissioner_id;
        const status = isPublicPool ? 'created' : 'active';

        // Create lead - simple message-based inquiry
        const { data: lead, error } = await supabaseAdmin
            .from('leads')
            .insert({
                commissioner_id,
                client_name,
                client_phone,
                client_email,
                project_summary,
                budget,
                status // Use dynamic status
            })
            .select('*')
            .single();

        if (error) throw error;

        // Audit Log
        await db.createAuditLog(
            user_id || (commissioner_id ? lead.commissioner_id : null),
            'commissioner',
            'lead_created',
            { lead_id: lead.id, client_name, note: 'Public Pool Lead - Message inquiry' }
        );

        return NextResponse.json({
            success: true,
            data: {
                lead_id: lead.id,
                message: 'Lead added to Public Pool successfully.'
            }
        });
    } catch (error: any) {
        console.error('Error creating lead:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create lead' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Public Pool Logic: Fetch ALL leads
        const { data: leads, error } = await supabaseAdmin
            .from('leads')
            .select(`
                *,
                commissioner:commissioners (
                    id,
                    user:users (
                        name,
                        email,
                        avatar_url
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data: leads });
    } catch (error: any) {
        console.error('Error fetching leads:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch leads' },
            { status: 500 }
        );
    }
}
