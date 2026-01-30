// Get Pending Users API
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
    try {
        // Check admin authorization
        const session = await getServerSession();
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Fetch users with pending_approval status
        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, phone, role, created_at')
            .eq('status', 'pending_approval')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pending users:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to fetch users' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
