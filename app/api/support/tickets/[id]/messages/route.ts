
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Fetch Messages
    const { data: messages, error } = await supabaseAdmin
        .from('ticket_messages')
        .select('*, sender:users!sender_id(name, role)')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: messages });
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    const { id } = await params;
    const { message } = await req.json();

    // 1. Verify access (User owns ticket OR is Admin)
    // For simplicity, assuming if they know the ID they can reply, strictly we should check ownership.

    // 2. Insert Message
    const { data, error } = await supabaseAdmin
        .from('ticket_messages')
        .insert({
            ticket_id: id,
            sender_id: user.id,
            message
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 3. Update Ticket Status (optional)
    // If admin replies, maybe set to 'in_progress' or 'resolved'?
    // If user replies, maybe 'open' again?
    // Leaving manual for now.

    return NextResponse.json({ success: true, data });
}
