
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findBestDevelopersForProject } from '@/lib/matcher';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const matches = await findBestDevelopersForProject(id);

        return NextResponse.json({ success: true, matches });

    } catch (error: any) {
        console.error('Matcher Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
