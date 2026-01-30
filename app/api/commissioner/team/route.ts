import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'commissioner') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // 1. Get current commissioner details
        const { data: me } = await supabaseAdmin
            .from('commissioners')
            .select('id, referral_code, tier, rate_percent')
            .eq('user_id', userId)
            .single();

        if (!me) {
            return NextResponse.json({ message: 'Commissioner profile not found' }, { status: 404 });
        }

        // 2. Fetch Downline (direct referrals)
        const { data: downline } = await supabaseAdmin
            .from('commissioners')
            .select(`
                id,
                tier,
                created_at,
                user:users (name, email)
            `)
            .eq('parent_commissioner_id', me.id);

        // 3. Calculate actual revenue and overrides for EACH downline agent
        const teamData = await Promise.all((downline || []).map(async (agent: any) => {
            // Get all projects for this agent
            const { data: projData } = await supabaseAdmin
                .from('projects')
                .select('budget')
                .eq('commissioner_id', agent.id)
                .eq('status', 'completed'); // Only completed projects count for revenue summary

            const revenue = projData?.reduce((sum, p) => sum + Number(p.budget), 0) || 0;

            // Parent gets 5% override of agent's revenue (as per specification)
            const my_earnings = revenue * 0.05;

            return {
                id: agent.id,
                name: agent.user?.name || 'Unknown',
                level: agent.tier || 'bronze',
                joined: new Date(agent.created_at).toLocaleDateString(),
                revenue,
                my_earnings
            };
        }));

        const totalTeamRevenue = teamData.reduce((sum, a) => sum + a.revenue, 0);
        const totalOverrides = teamData.reduce((sum, a) => sum + a.my_earnings, 0);

        return NextResponse.json({
            referralCode: me.referral_code,
            level: me.tier,
            downline: teamData,
            stats: {
                totalAgents: teamData.length,
                teamRevenue: totalTeamRevenue,
                lifetimeOverrides: totalOverrides
            }
        });

    } catch (error: any) {
        console.error('Team API Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
