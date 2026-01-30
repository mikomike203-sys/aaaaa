import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { paystackPayments } from '@/lib/payments/paystack';
import { emailService } from '@/lib/email';

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

        // 1. Get Invoice Details
        const { data: invoice, error: fetchError } = await supabaseAdmin
            .from('invoices')
            .select(`
                *,
                client:clients(name, contact_person, user:users(email))
            `)
            .eq('id', id)
            .single();

        if (fetchError || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (invoice.status !== 'pending_approval') {
            return NextResponse.json({ error: 'Invoice is already processed' }, { status: 400 });
        }

        const clientEmail = invoice.client?.user?.email || 'admin@techdevelopers.co.ke'; // Fallback
        const clientName = invoice.client?.name || 'Valued Client';

        // 2. Generate Payment Link via Paystack
        const paystackResponse = await paystackPayments.initializeTransaction(
            clientEmail,
            Number(invoice.amount),
            undefined,
            {
                custom_fields: [
                    { display_name: "Invoice Number", variable_name: "invoice_number", value: invoice.invoice_number },
                    { display_name: "Client Name", variable_name: "client_name", value: clientName }
                ],
                invoice_number: invoice.invoice_number,
                description: invoice.description
            }
        );

        if (!paystackResponse || !paystackResponse.data) {
            throw new Error('Failed to generate payment link from Paystack');
        }

        const paymentUrl = paystackResponse.data.authorization_url;

        // 3. Update Invoice in DB
        const { error: updateError } = await supabaseAdmin
            .from('invoices')
            .update({
                status: 'approved',
                approved_at: new Date(),
                approved_by: (session.user as any).id,
                paystack_url: paymentUrl,
                paystack_reference: paystackResponse.data.reference
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // 4. Send Email
        await emailService.sendInvoice(
            clientEmail,
            clientName,
            invoice.amount,
            invoice.description,
            invoice.invoice_number,
            paymentUrl
        );

        return NextResponse.json({ success: true, message: 'Invoice approved and sent to client' });

    } catch (error: any) {
        console.error('Approval Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
