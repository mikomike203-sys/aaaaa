// API Route: Admin Payment Verification
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, db } from '@/lib/db';
import { createEscrowHold } from '@/lib/escrow';
import { emailService } from '@/lib/email';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paymentId } = await params;
        const body = await request.json();
        const { admin_id, notes } = body;

        // Verify admin role
        const { data: admin } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', admin_id)
            .single();

        if (!admin || admin.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized - admin access required' },
                { status: 403 }
            );
        }

        // Get payment details
        const payment = await db.getPaymentById(paymentId);
        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        if (payment.status !== 'pending_verification') {
            return NextResponse.json(
                { error: 'Payment already processed' },
                { status: 400 }
            );
        }

        // Get project details
        const project = await db.getProjectById(payment.project_id);

        // Create escrow hold entry
        await createEscrowHold(
            payment.project_id,
            paymentId,
            payment.amount,
            project.escrow_balance
        );

        // Update payment status
        await supabaseAdmin
            .from('payments')
            .update({
                status: 'verified',
                verified_by_admin_id: admin_id,
                verified_at: new Date().toISOString()
            })
            .eq('id', paymentId);

        // Create audit log
        await db.createAuditLog(
            admin_id,
            'admin',
            'payment_verified',
            {
                payment_id: paymentId,
                project_id: payment.project_id,
                amount: payment.amount,
                notes
            }
        );

        // Send verification email to client
        if (project.client?.user?.email) {
            await emailService.sendDepositVerified(
                project.client.user.email,
                project.title,
                project.milestones?.[0]?.due_date?.toString()
            );
        }

        // Notify commissioner
        if (project.commissioner?.user_id) {
            await db.createNotification(
                project.commissioner.user_id,
                'in_app',
                'Deposit Verified - Project Active',
                `Your project "${project.title}" is now active`
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified and escrow created',
            data: { payment_id: paymentId, project_id: payment.project_id }
        });
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
