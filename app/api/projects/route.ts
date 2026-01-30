// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        let projects = [];

        if (role === 'client') {
            const { data: client } = await supabaseAdmin
                .from('clients')
                .select('id')
                .eq('user_id', userId)
                .single();
            if (client) {
                projects = await db.getProjectsByClient(client.id);
            }
        } else if (role === 'developer') {
            const { data: developer } = await supabaseAdmin
                .from('developers')
                .select('id')
                .eq('user_id', userId)
                .single();
            if (developer) {
                projects = await db.getProjectsByDeveloper(developer.id);
            }
        } else if (role === 'admin') {
            const { data: allProjects } = await supabaseAdmin
                .from('projects')
                .select('*, milestones:project_milestones(*)')
                .order('created_at', { ascending: false });
            projects = allProjects || [];
        } else if (role === 'commissioner') {
            const { data: commissioner } = await supabaseAdmin
                .from('commissioners')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (commissioner) {
                const { data: commProjects } = await supabaseAdmin
                    .from('projects')
                    .select('*')
                    .eq('commissioner_id', commissioner.id)
                    .order('created_at', { ascending: false });
                projects = commProjects || [];
            }
        }

        return NextResponse.json({ success: true, data: projects });
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            projectType,
            title,
            description,
            budget,
            timeline,
            skills,
            commissionerId,
        } = body;

        const userId = (session.user as any).id;

        //  Get client_id from user
        const { data: client } = await supabaseAdmin
            .from('clients')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!client) {
            return NextResponse.json({ error: 'Client profile not found' }, { status: 400 });
        }

        // Create project
        const { data: project, error } = await supabaseAdmin
            .from('projects')
            .insert({
                client_id: client.id,
                commissioner_id: projectType === 'direct' ? commissionerId : null,
                lead_id: body.leadId || null,
                title,
                description,
                budget,
                timeline,
                skills: skills || [],
                status: projectType === 'direct' ? 'active' : 'pending',
                project_type: projectType,
            })
            .select()
            .single();

        if (error) throw error;

        // If it was from a lead, mark the lead as converted
        if (body.leadId) {
            await supabaseAdmin
                .from('leads')
                .update({ status: 'converted', updated_at: new Date() })
                .eq('id', body.leadId);
        }

        return NextResponse.json({
            success: true,
            data: project,
        });
    } catch (error: any) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create project' },
            { status: 500 }
        );
    }
}
