// API Route: Calculate Commissions for Project
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCommissionRecords } from '@/lib/commission';

export async function POST(request: NextRequest) {
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
        const { project_id, commissioner_id, project_value } = body;

        if (!project_id || !commissioner_id || !project_value) {
            return NextResponse.json(
                { error: 'Missing required fields: project_id, commissioner_id, project_value' },
                { status: 400 }
            );
        }

        const result = await createCommissionRecords(
            project_id,
            commissioner_id,
            Number(project_value)
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to calculate commissions' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            breakdown: result.breakdown,
            transactions: result.transactions,
        });
    } catch (error: any) {
        console.error('Error in commission calculation API:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to calculate commissions' },
            { status: 500 }
        );
    }
}
