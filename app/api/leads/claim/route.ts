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
        const commissionerId = (session.user as any).commissioner_id; // Check if this is available in session or fetch it

        // If commissioner_id is missing from session, fetch it
        let commId = commissionerId;
        if (!commId) {
            const { data: comm } = await supabaseAdmin
                .from('commissioners')
                .select('id')
                .eq('user_id', userId)
                .single();
            if (!comm) throw new Error('Commissioner profile not found');
            commId = comm.id;
        }

        // 1. Check Capacity (Max 3 Active Leads)
        // Active = claimed, contacted, in_progress (not converted, lost, or closed)
        const { count, error: countError } = await supabaseAdmin
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('claimed_by', commId)
            .in('status', ['claimed', 'contacted', 'in_progress']);

        if (countError) throw countError;

        if ((count || 0) >= 3) {
            return NextResponse.json({
                success: false,
                message: 'Capacity Limit Reached. You have 3 active leads. Close some before claiming more.'
            }, { status: 400 });
        }

        // 2. Check if Lead is still available
        const { data: lead } = await supabaseAdmin
            .from('leads')
            .select('id, claimed_by')
            .eq('id', leadId)
            .single();

        if (lead?.claimed_by) {
            return NextResponse.json({ success: false, message: 'This lead has just been claimed by someone else.' }, { status: 409 });
        }

        // 3. Claim the Lead
        const { error: claimError } = await supabaseAdmin
            .from('leads')
            .update({
                claimed_by: commId,
                claimed_at: new Date(),
                status: 'claimed'
            })
            .eq('id', leadId);

        if (claimError) throw claimError;

        // 4. Audit Log
        await db.createAuditLog(
            userId,
            'commissioner',
            'lead_claimed',
            { lead_id: leadId }
        );

        return NextResponse.json({ success: true, message: 'Lead claimed successfully!' });

    } catch (error: any) {
        console.error('Claim Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
