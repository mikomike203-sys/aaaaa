import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;

    const { data: files, error } = await supabaseAdmin
        .from('project_files')
        .select('*, uploader:users(name)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: files });
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    const body = await req.json();
    const { file_name, file_url, file_type, size_bytes, description, category } = body;

    const { data, error } = await supabaseAdmin
        .from('project_files')
        .insert({
            project_id: projectId,
            uploader_id: (session.user as any).id,
            file_name,
            file_url,
            file_type,
            size_bytes,
            description,
            category: category || 'general'
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
}
