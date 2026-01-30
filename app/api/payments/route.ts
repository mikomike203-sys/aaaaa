import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { role, id: userId } = session.user as any;

    try {
        let query = supabaseAdmin
            .from('payments')
            .select(`
                *,
                projects (
                    title,
                    client_id,
                    developer_id
                )
            `)
            .order('created_at', { ascending: false });

        if (role === 'admin') {
            // Admin sees everything
        } else if (role === 'client') {
            // Client sees payments they made. 
            // We need to join via project or payer_id.
            query = query.eq('payer_id', userId);
        } else if (role === 'developer') {
            // Developers might want to see project payments (though they don't make them)
            // For now, developers might not need this endpoint as much as 'payouts'
            // But we'll allow them to see payments for projects they are assigned to.
            query = query.eq('projects.developer_id', userId);
        } else {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { data: payments, error } = await query;

        if (error) throw error;

        return NextResponse.json({ success: true, data: payments });
    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
