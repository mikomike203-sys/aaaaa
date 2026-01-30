import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

// GET: List invoices (Admin or Commissioner)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        let query = supabaseAdmin
            .from('invoices')
            .select(`
                *,
                client:clients(id, user:users(name, email)),
                project:projects(title)
            `)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        // If not admin, maybe filter by their projects? 
        // For now assuming this endpoint is primarily for the Admin Dashboard

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Create a new Invoice Request (Pending Approval)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const {
            client_id,
            project_id,
            amount,
            description,
            invoice_number,
            commissioner_id,
            items // Dynamic Array of { description, quantity, unit_price, total_price }
        } = body;

        const userId = (session.user as any).id;
        const userRole = (session.user as any).role;

        let activeCommId = commissioner_id;

        // Ensure we have a commissioner ID if not admin
        if (userRole === 'commissioner' && !activeCommId) {
            const { data: comm } = await supabaseAdmin
                .from('commissioners')
                .select('id')
                .eq('user_id', userId)
                .single();
            if (comm) activeCommId = comm.id;
        }

        if (!activeCommId && userRole !== 'admin') {
            return NextResponse.json({ error: 'Commissioner profile required to create invoices' }, { status: 403 });
        }

        // 0. Anti-duplication: Check for identical pending invoice in the last 5 minutes
        const { data: existing } = await supabaseAdmin
            .from('invoices')
            .select('id')
            .eq('project_id', project_id)
            .eq('amount', amount)
            .eq('status', 'pending_approval')
            .gt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

        if (existing && existing.length > 0) {
            return NextResponse.json({ error: 'A similar pending invoice was already submitted recently' }, { status: 409 });
        }

        // 1. Create invoice in DB with 'pending_approval' status
        const { data: invoice, error } = await supabaseAdmin
            .from('invoices')
            .insert({
                client_id: client_id || null,
                project_id,
                commissioner_id: activeCommId,
                amount,
                description,
                invoice_number: invoice_number || `INV-${Date.now()}`,
                status: 'pending_approval',
                currency: 'KES'
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Insert invoice details if items provided
        if (items && Array.isArray(items) && items.length > 0) {
            const { error: itemsError } = await supabaseAdmin
                .from('invoice_items')
                .insert(
                    items.map(item => ({
                        invoice_id: invoice.id,
                        description: item.description,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        total_price: item.total_price
                    }))
                );
            if (itemsError) throw itemsError;
        }

        return NextResponse.json({
            success: true,
            data: invoice,
            message: 'Detailed invoice request submitted for admin approval.'
        });

    } catch (error: any) {
        console.error('Invoice Creation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create invoice request' },
            { status: 500 }
        );
    }
}
