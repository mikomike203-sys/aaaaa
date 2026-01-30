// API Route: Create Payment Checkout
import { NextRequest, NextResponse } from 'next/server';
import { coinbasePayments } from '@/lib/payments/coinbase';
import { paystackPayments } from '@/lib/payments/paystack';
import { supabaseAdmin, db } from '@/lib/db';
import { PLATFORM_CONFIG } from '@/lib/escrow';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { lead_id, method, client_email, client_phone } = body;

        // Get lead and commissioner data
        const { data: lead } = await supabaseAdmin
            .from('leads')
            .select('*, commissioner:commissioners(*)')
            .eq('id', lead_id)
            .single();

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        const depositAmount = (lead.budget * PLATFORM_CONFIG.DEPOSIT_PERCENT) / 100;
        const baseUrl = process.env.NEXTAUTH_URL!;
        const successUrl = `${baseUrl}/payment/success?lead_id=${lead_id}`;
        const cancelUrl = `${baseUrl}/intake/${lead.intake_token}`;

        let paymentUrl = '';
        let gatewayData: any = {};
        let gateway = '';

        // Handle different payment methods (Prioritizing Paystack)
        if (method === 'card' || method === 'mpesa' || method === 'paystack') {
            const response = await paystackPayments.initializeTransaction(
                client_email || lead.client_email,
                depositAmount,
                successUrl,
                {
                    project_id: lead_id,
                    payment_type: 'deposit'
                }
            );
            paymentUrl = response.data.authorization_url;
            gatewayData = { reference: response.data.reference, access_code: response.data.access_code };
            gateway = 'paystack';
        } else if (method === 'crypto') {
            const charge = await coinbasePayments.createCharge(
                depositAmount,
                'USD',
                lead_id,
                successUrl,
                cancelUrl
            );
            paymentUrl = charge.hosted_url;
            gatewayData = { charge_id: charge.id, charge_code: charge.code };
            gateway = 'coinbase';
        } else {
            return NextResponse.json(
                { error: 'Unsupported payment method' },
                { status: 400 }
            );
        }

        // Create payment record
        const { data: payment } = await supabaseAdmin
            .from('payments')
            .insert({
                project_id: lead_id, // Will link to project later
                method,
                gateway,
                currency: method === 'crypto' ? 'USD' : 'KES',
                amount: depositAmount,
                status: 'pending_verification',
                raw_payload: gatewayData
            })
            .select()
            .single();

        // Update lead status
        await supabaseAdmin
            .from('leads')
            .update({ status: 'deposit_paid' })
            .eq('id', lead_id);

        return NextResponse.json({
            success: true,
            data: {
                payment_id: payment?.id,
                payment_url: paymentUrl,
                amount: depositAmount
            }
        });
    } catch (error: any) {
        console.error('Error creating checkout:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout' },
            { status: 500 }
        );
    }
}
