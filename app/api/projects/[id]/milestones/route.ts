import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

// GET /api/projects/[id]/milestones - Fetch all milestones for a project
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { data: milestones, error } = await supabaseAdmin
            .from('project_milestones')
            .select('*')
            .eq('project_id', params.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching milestones:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(milestones || []);
    } catch (err: any) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/projects/[id]/milestones - Create a new milestone
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        const { data: milestone, error } = await supabaseAdmin
            .from('project_milestones')
            .insert({
                project_id: params.id,
                title: body.title,
                description: body.description,
                percent_amount: body.percent_amount || 0,
                due_date: body.due_date,
                status: body.status || 'pending',
                checklist: body.checklist || [],
                progress: 0
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating milestone:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(milestone);
    } catch (err: any) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
