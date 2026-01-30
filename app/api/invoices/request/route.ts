// API Route: Request Invoice via Email
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { payment_id, email } = body;

        if (!payment_id || !email) {
            return NextResponse.json({ error: 'Payment ID and email are required' }, { status: 400 });
        }

        // Fetch payment details
        const { data: payment, error } = await supabaseAdmin
            .from('payments')
            .select('*, projects(title)')
            .eq('id', payment_id)
            .single();

        if (error || !payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // Create invoice record
        const { data: invoice, error: invoiceError } = await supabaseAdmin
            .from('invoices')
            .insert({
                payment_id,
                email,
                status: 'pending',
                amount: payment.amount,
            })
            .select()
            .single();

        if (invoiceError) throw invoiceError;

        // TODO: Send email with invoice (integrate with email service)
        // For now, we just create the record

        return NextResponse.json({
            success: true,
            message: 'Invoice request submitted successfully',
            data: invoice,
        });
    } catch (error: any) {
        console.error('Error requesting invoice:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to request invoice' },
            { status: 500 }
        );
    }
}
