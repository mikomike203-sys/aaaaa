// Webhook: Paystack Payment Events
import { NextRequest, NextResponse } from 'next/server';
import { paystackPayments } from '@/lib/payments/paystack';
import { supabaseAdmin, db } from '@/lib/db';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-paystack-signature');

        if (!signature) {
            return NextResponse.json({ error: 'No signature' }, { status: 401 });
        }

        // Verify webhook signature
        const isValid = paystackPayments.verifyWebhookSignature(signature, body);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);

        // Handle successful payment
        if (event.event === 'charge.success') {
            const data = event.data;
            const reference = data.reference;
            const projectId = data.metadata?.project_id;

            // Find payment record by reference in raw_payload
            // Note: Since we store reference in raw_payload, we might need a better query
            // but for now we look for project and status
            const { data: payment } = await supabaseAdmin
                .from('payments')
                .select('*')
                .eq('project_id', projectId)
                .eq('gateway', 'paystack')
                .eq('status', 'pending_verification')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (payment) {
                // Update payment with actual transaction ID from Paystack
                await supabaseAdmin
                    .from('payments')
                    .update({
                        tx_hash: reference,
                        status: 'pending_verification', // Keeps original flow (Awaits admin verification)
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', payment.id);

                // Update lead status to deposit_paid (redundant but safe)
                await supabaseAdmin
                    .from('leads')
                    .update({ status: 'deposit_paid' })
                    .eq('id', projectId);

                // Create audit log
                await db.createAuditLog(
                    payment.payer_id || projectId,
                    'client',
                    'payment_webhook_received',
                    { payment_id: payment.id, gateway: 'paystack', reference }
                );

                // Send email receipt
                await emailService.sendPaymentReceipt(
                    data.customer.email,
                    `Project Deposit`,
                    data.amount / 100,
                    data.currency,
                    reference
                );

                // Notify admins
                const { data: admins } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('role', 'admin');

                if (admins) {
                    for (const admin of admins) {
                        await db.createNotification(
                            admin.id,
                            'in_app',
                            'New Paystack Payment Received',
                            `A deposit of ${data.currency} ${data.amount / 100} has been paid and is pending verification.`
                        );
                    }
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Paystack webhook error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
