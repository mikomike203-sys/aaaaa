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
        if (role === 'commissioner') {
            // Get commissioner ID for this user
            const { data: commissioner } = await supabaseAdmin
                .from('commissioners')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (!commissioner) {
                return NextResponse.json({ success: true, data: [] });
            }

            // Fetch commissions for this commissioner only
            const { data: earnings, error } = await supabaseAdmin
                .from('commissions')
                .select(`
                    *,
                    projects (
                        title,
                        total_value
                    )
                `)
                .eq('commissioner_id', commissioner.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return NextResponse.json({ success: true, data: earnings });

        } else if (role === 'developer') {
            // Fetch payouts for this developer
            const { data: earnings, error } = await supabaseAdmin
                .from('payouts')
                .select(`
                    *,
                    projects (
                        title
                    )
                `)
                .eq('recipient_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return NextResponse.json({ success: true, data: earnings });

        } else if (role === 'admin') {
            // Admin could see global earnings summary? 
            // For now, let's return error or empty.
            return NextResponse.json({ success: false, message: 'Use admin analytic endpoints for global data' }, { status: 400 });
        }

        return NextResponse.json({ success: false, message: 'Not applicable for this role' }, { status: 403 });

    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
