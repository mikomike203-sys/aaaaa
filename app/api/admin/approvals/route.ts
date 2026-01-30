import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id, type, action } = await req.json();

        if (!id || !type || !action) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        const table = type === 'commissioner' ? 'commissioners' : 'developers';
        const newStatus = action === 'approve' ? 'approved' : 'rejected';

        // Update the role-specific table
        const { error: roleError } = await db.supabaseAdmin
            .from(table)
            .update({
                kyc_status: newStatus,
                verified_at: action === 'approve' ? new Date() : null
            })
            .eq('id', id);

        if (roleError) {
            throw roleError;
        }

        // Also update the main user verified status if approved
        if (action === 'approve') {
            // Fetch user_id first
            const { data: roleHeader } = await db.supabaseAdmin
                .from(table)
                .select('user_id')
                .eq('id', id)
                .single();

            if (roleHeader?.user_id) {
                await db.supabaseAdmin
                    .from('users')
                    .update({ verified: true })
                    .eq('id', roleHeader.user_id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Approval Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
