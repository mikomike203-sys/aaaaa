import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

type ChecklistItem = {
    id: number;
    text: string;
    completed: boolean;
};

// GET /api/milestones/[id] - Fetch milestone with checklist
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { data: milestone, error } = await supabaseAdmin
            .from('project_milestones')
            .select('*, project:projects(title, client_id, developer_id, commissioner_id)')
            .eq('id', params.id)
            .single();

        if (error) {
            console.error('Error fetching milestone:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!milestone) {
            return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
        }

        return NextResponse.json(milestone);
    } catch (err: any) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH /api/milestones/[id] - Update milestone checklist
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { checklist, ...otherUpdates } = body;

        // Calculate progress from checklist if provided
        let progress = otherUpdates.progress;
        if (checklist && Array.isArray(checklist)) {
            const totalItems = checklist.length;
            const completedItems = checklist.filter((item: ChecklistItem) => item.completed).length;
            progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        }

        const updateData: any = {
            ...otherUpdates,
            updated_at: new Date().toISOString()
        };

        if (checklist !== undefined) {
            updateData.checklist = checklist;
        }

        if (progress !== undefined) {
            updateData.progress = progress;
        }

        const { data: milestone, error } = await supabaseAdmin
            .from('project_milestones')
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating milestone:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(milestone);
    } catch (err: any) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE /api/milestones/[id] - Delete milestone
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { error } = await supabaseAdmin
            .from('project_milestones')
            .delete()
            .eq('id', params.id);

        if (error) {
            console.error('Error deleting milestone:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
