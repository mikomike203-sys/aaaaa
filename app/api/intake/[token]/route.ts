// API Route: Get Intake Page Data
import { NextRequest, NextResponse } from 'next/server';
import { db, supabaseAdmin } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        // Get lead with commissioner info
        const lead = await db.getLeadByToken(token);

        if (!lead) {
            return NextResponse.json(
                { error: 'Invalid or expired intake link' },
                { status: 404 }
            );
        }

        // Mark as viewed if first time
        if (!lead.viewed_at) {
            await supabaseAdmin
                .from('leads')
                .update({
                    status: 'viewed',
                    viewed_at: new Date().toISOString()
                })
                .eq('id', lead.id);
        }

        // Prepare response data
        const intakeData = {
            lead: {
                id: lead.id,
                client_name: lead.client_name,
                project_summary: lead.project_summary,
                budget: lead.budget
            },
            commissioner: {
                name: lead.commissioner.user.name,
                photo: lead.commissioner.user.avatar_url,
                rating: 4.8, // TODO: Calculate from reviews
                contact: lead.commissioner.user.phone
            },
            projectSummary: lead.project_summary || 'Custom development project',
            estimatedTotal: lead.budget || 10000,
            milestones: [
                { title: 'Discovery & Planning', description: 'Requirements gathering and wireframes', percent: 20 },
                { title: 'Design & Prototype', description: 'UI/UX design and interactive prototype', percent: 20 },
                { title: 'Development', description: 'Full development and integrations', percent: 40 },
                { title: 'Testing & Launch', description: 'QA, deployment, and handover', percent: 20 }
            ]
        };

        return NextResponse.json({ success: true, data: intakeData });
    } catch (error: any) {
        console.error('Error fetching intake data:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to load intake page' },
            { status: 500 }
        );
    }
}
