// User Approval API (Admin Only)
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check admin authorization
        const session = await getServerSession();
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { id: userId } = await params;
        const { action, notes } = await req.json(); // action: 'approve' or 'reject'

        // Get user details
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        if (action === 'approve') {
            // Update user status
            await supabaseAdmin
                .from('users')
                .update({
                    status: 'active',
                    verified: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            // Create audit log
            await supabaseAdmin.from('audit_logs').insert({
                user_id: (session.user as any).id,
                action: 'user_approved',
                details: {
                    approved_user_id: userId,
                    approved_user_email: user.email,
                    approved_user_role: user.role,
                    notes
                }
            });

            // TODO: Send approval email to user
            // "Your account has been approved! You can now login."

            return NextResponse.json({
                success: true,
                message: 'User approved successfully',
                data: { userId, status: 'active' }
            });

        } else if (action === 'reject') {
            // Update user status to rejected
            await supabaseAdmin
                .from('users')
                .update({
                    status: 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            // Create audit log
            await supabaseAdmin.from('audit_logs').insert({
                user_id: (session.user as any).id,
                action: 'user_rejected',
                details: {
                    rejected_user_id: userId,
                    rejected_user_email: user.email,
                    rejected_user_role: user.role,
                    notes
                }
            });

            // TODO: Send rejection email
            // "Your application has been reviewed..."

            return NextResponse.json({
                success: true,
                message: 'User rejected',
                data: { userId, status: 'rejected' }
            });

        } else {
            return NextResponse.json(
                { success: false, message: 'Invalid action' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('User approval error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
