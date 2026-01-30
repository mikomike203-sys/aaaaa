// API Route: Team Stats for Commissioner
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Get commissioner ID
        const { data: commissioner } = await supabaseAdmin
            .from('commissioners')
            .select('id, referral_code')
            .eq('user_id', userId)
            .single();

        if (!commissioner) {
            return NextResponse.json({ error: 'Commissioner not found' }, { status: 404 });
        }

        // Get referrals (users who used this commissioner's referral code)
        const { data: referrals } = await supabaseAdmin
            .from('users')
            .select(`
                id,
                name,
                email,
                created_at,
                commissioners(
                    id,
                    completed_count,
                    rating
                )
            `)
            .eq('referrer_id', userId);

        // Calculate team stats
        const totalReferrals = referrals?.length || 0;

        // Get commission transactions for downline
        const downlineCommissionerIds = (referrals || [])
            .filter(r => r.commissioners && r.commissioners.length > 0)
            .map(r => r.commissioners[0].id);

        let teamRevenue = 0;
        let passiveEarnings = 0;

        if (downlineCommissionerIds.length > 0) {
            // Get all projects by downline commissioners
            const { data: downlineProjects } = await supabaseAdmin
                .from('projects')
                .select('budget')
                .in('commissioner_id', downlineCommissionerIds)
                .eq('status', 'completed');

            teamRevenue = (downlineProjects || []).reduce(
                (acc, p) => acc + (Number(p.budget) || 0),
                0
            );

            // Get override commissions
            const { data: overrideCommissions } = await supabaseAdmin
                .from('commission_transactions')
                .select('amount')
                .eq('commissioner_id', commissioner.id)
                .eq('commission_type', 'override');

            passiveEarnings = (overrideCommissions || []).reduce(
                (acc, c) => acc + Number(c.amount),
                0
            );
        }

        // Format downline data
        const downlineList = (referrals || []).map(r => ({
            name: r.name,
            email: r.email,
            joinedDate: r.created_at,
            projectsCompleted: r.commissioners?.[0]?.completed_count || 0,
            rating: r.commissioners?.[0]?.rating || 0,
        }));

        return NextResponse.json({
            success: true,
            data: {
                totalReferrals,
                teamRevenue,
                passiveEarnings,
                referralCode: commissioner.referral_code,
                downline: downlineList,
            },
        });
    } catch (error: any) {
        console.error('Error fetching team stats:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch team stats' },
            { status: 500 }
        );
    }
}
