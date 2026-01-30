import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin, db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'commissioner') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { leadId } = await req.json();
        const userId = (session.user as any).id;

        // 1. Verify Ownership
        const { data: lead } = await supabaseAdmin
            .from('leads')
            .select('id, claimed_by, status')
            .eq('id', leadId)
            .single();

        // Get commissioner ID from session or DB
        const commId = (session.user as any).commissioner_id; // Check session structure or fetch
        // For robustness, let's verify via DB if session might require refresh
        const { data: comm } = await supabaseAdmin.from('commissioners').select('id').eq('user_id', userId).single();

        if (!comm) {
            return NextResponse.json({ message: 'Commissioner profile not found' }, { status: 404 });
        }

        if (!lead || lead.claimed_by !== comm.id) {
            return NextResponse.json({ message: 'Lead not owned by you' }, { status: 403 });
        }

        // 2. Update Lead
        const { error } = await supabaseAdmin
            .from('leads')
            .update({
                first_contact_at: new Date(),
                status: 'contacted'
            })
            .eq('id', leadId);

        if (error) throw error;

        // 3. Audit Log
        await db.createAuditLog(
            userId,
            'commissioner',
            'lead_contacted',
            { lead_id: leadId }
        );

        return NextResponse.json({ success: true, message: 'Contact logged successfully!' });

    } catch (error: any) {
        console.error('Contact Log Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
