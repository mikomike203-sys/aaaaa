import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { reason } = body;

        // Update Invoice status to rejected
        const { error } = await supabaseAdmin
            .from('invoices')
            .update({
                status: 'rejected',
                updated_at: new Date(),
                // could add rejection_reason column if schema supported it
            })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Invoice rejected' });

    } catch (error: any) {
        console.error('Rejection Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
