import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { createCommissionRecords } from '@/lib/commission';

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

        // 1. Get Project Details
        const { data: project, error: fetchError } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.status === 'completed') {
            return NextResponse.json({ error: 'Project already completed' }, { status: 400 });
        }

        // 2. Release Funds to Developer (if assigned)
        if (project.developer_id) {
            const amountToRelease = project.escrow_balance || project.total_value;

            // Update Developer Balances
            // Assuming funds were in 'pending_balance' when project started/funded.
            // Move from Pending -> Available.

            // First, fetch current dev stats
            const { data: dev } = await supabaseAdmin
                .from('developers')
                .select('pending_balance, available_balance')
                .eq('id', project.developer_id)
                .single();

            if (dev) {
                const newPending = Math.max(0, (dev.pending_balance || 0) - amountToRelease);
                const newAvailable = (dev.available_balance || 0) + amountToRelease;

                await supabaseAdmin
                    .from('developers')
                    .update({
                        pending_balance: newPending,
                        available_balance: newAvailable
                    })
                    .eq('id', project.developer_id);
            }
        }

        // 3. Process Commissions
        if (project.commissioner_id) {
            // Calculate and insert commission records (Status: pending)
            const result = await createCommissionRecords(
                project.id,
                project.commissioner_id,
                Number(project.total_value)
            );

            if (result.success) {
                // Immediately mark these commissions as 'available' (funds released)
                // We identify them by project_id
                await supabaseAdmin
                    .from('commission_transactions')
                    .update({ status: 'available' })
                    .eq('project_id', project.id);
            }
        }

        // 4. Update Project Status
        const { error: updateError } = await supabaseAdmin
            .from('projects')
            .update({
                status: 'completed',
                escrow_status: 'released',
                escrow_balance: 0,
                updated_at: new Date()
            })
            .eq('id', id);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, message: 'Project shipped and funds released' });

    } catch (error: any) {
        console.error('Shipping Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
