import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin as supabase } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Get Developer ID from User Email
        const { data: developer, error: devError } = await supabase
            .from('developers')
            .select('id, reliability_score, pending_balance, available_balance, is_blacklisted, user_id')
            .eq('user_id', (session.user as any).id) // Assuming session has ID, else fetch by email
            .single();

        if (devError || !developer) {
            // Fallback: Try fetching by email from users table join if session.user.id isn't reliable
            const { data: user } = await supabase.from('users').select('id').eq('email', session.user.email).single();
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            const { data: devRetry } = await supabase
                .from('developers')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!devRetry) return NextResponse.json({ error: 'Developer profile not found' }, { status: 404 });

            // Use devRetry
            return getData(devRetry);
        }

        return getData(developer);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function getData(developer: any) {
    // 2. Fetch Active Projects (via Squads)
    const { data: squads, error: squadError } = await supabase
        .from('project_squads')
        .select(`
      role,
      percent_allocation,
      project:projects (
        id,
        title,
        status,
        total_value,
        client:clients (
          company_name,
          contact_person
        ),
        milestones:project_milestones (
          id,
          title,
          status,
          percent_amount,
          due_date,
          type
        )
      )
    `)
        .eq('developer_id', developer.id);

    if (squadError) throw squadError;

    // 3. Calculate "Burn Rate" / Timeline for each project
    const projects = squads?.map((item: any) => {
        const project = item.project;
        const activeMilestone = project.milestones?.find((m: any) => m.status === 'in_progress' || m.status === 'pending');

        // Burn Rate Logic: Days remaining for active milestone
        let daysRemaining = 0;
        if (activeMilestone && activeMilestone.due_date) {
            const due = new Date(activeMilestone.due_date);
            const now = new Date();
            const diff = due.getTime() - now.getTime();
            daysRemaining = Math.ceil(diff / (1000 * 3600 * 24));
        }

        return {
            ...project,
            role: item.role,
            allocation: item.percent_allocation,
            active_milestone: activeMilestone,
            days_remaining: daysRemaining
        };
    });

    return NextResponse.json({
        success: true,
        data: {
            profile: developer,
            projects: projects || []
        }
    });
}
