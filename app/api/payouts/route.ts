// API Route: Payout Requests Management
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

// GET: Fetch payout requests (admin or own requests)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';

        let query = supabaseAdmin
            .from('commission_transactions')
            .select(`
                *,
                project:projects(title),
                commissioner:commissioners(
                    id,
                    mpesa_number,
                    user:users(name, avatar_url)
                )
            `)
            .eq('status', status)
            .order('created_at', { ascending: false });

        // If not admin, only show their own requests
        if (role !== 'admin') {
            const { data: commissioner } = await supabaseAdmin
                .from('commissioners')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (!commissioner) {
                return NextResponse.json({ success: true, data: [] });
            }

            query = query.eq('commissioner_id', commissioner.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ success: true, data: data || [] });
    } catch (error: any) {
        console.error('Error fetching payouts:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch payouts' },
            { status: 500 }
        );
    }
}

// POST: Create payout request (commissioner)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await request.json();
        const { amount, commission_transaction_ids } = body;

        // Get commissioner
        const { data: commissioner } = await supabaseAdmin
            .from('commissioners')
            .select('id, mpesa_number')
            .eq('user_id', userId)
            .single();

        if (!commissioner) {
            return NextResponse.json({ error: 'Commissioner profile not found' }, { status: 400 });
        }

        if (!commissioner.mpesa_number) {
            return NextResponse.json(
                { error: 'M-Pesa number not set. Please update your profile.' },
                { status: 400 }
            );
        }

        // Create payout request record (or mark transactions as requested)
        const { data, error } = await supabaseAdmin
            .from('commission_transactions')
            .update({ status: 'payout_requested' })
            .in('id', commission_transaction_ids)
            .select();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Payout request submitted successfully',
            data,
        });
    } catch (error: any) {
        console.error('Error creating payout request:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create payout request' },
            { status: 500 }
        );
    }
}

// PATCH: Approve/Reject payout (admin only)
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { transaction_ids, action } = body; // action: 'approve' | 'reject'

        if (!transaction_ids || !action) {
            return NextResponse.json(
                { error: 'Missing required fields: transaction_ids, action' },
                { status: 400 }
            );
        }

        const newStatus = action === 'approve' ? 'paid' : 'rejected';

        const { data, error } = await supabaseAdmin
            .from('commission_transactions')
            .update({
                status: newStatus,
                paid_at: action === 'approve' ? new Date().toISOString() : null
            })
            .in('id', transaction_ids)
            .select();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Payout ${action}d successfully`,
            data,
        });
    } catch (error: any) {
        console.error('Error updating payout:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update payout' },
            { status: 500 }
        );
    }
}
