
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;

    let query = supabaseAdmin
        .from('support_tickets')
        .select('*, sender:users!user_id(name, email, role), assignee:users!assigned_to(name)')
        .order('created_at', { ascending: false });

    // Admin sees all, others see only theirs
    if (user.role !== 'admin') {
        query = query.eq('user_id', user.id);
    }

    const { data: tickets, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: tickets });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    const body = await req.json();
    const { subject, description, category, priority } = body;

    const { data, error } = await supabaseAdmin
        .from('support_tickets')
        .insert({
            user_id: user.id,
            subject,
            description,
            category,
            priority: priority || 'medium',
            status: 'open'
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
}
