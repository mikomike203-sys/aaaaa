// API Route: Get Individual Project Details
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const projectId = params.id;

        const { data: project, error } = await supabaseAdmin
            .from('projects')
            .select(`
                *,
                team_members:project_team_members(
                    user:users(name, avatar_url)
                ),
                milestones:project_milestones(id, title, status, deliverable_link)
            `)
            .eq('id', projectId)
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: project });
    } catch (error: any) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch project' },
            { status: 500 }
        );
    }
}
