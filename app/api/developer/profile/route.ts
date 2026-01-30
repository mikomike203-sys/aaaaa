import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'developer') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const userId = (session.user as any).id;

        const { error } = await db.supabaseAdmin
            .from('developers')
            .update({
                bio: body.bio,
                tech_stack: body.tech_stack,
                experience_level: body.experience_level,
                portfolio_url: body.portfolio_url,
                github_url: body.github_url,
                roles: body.roles,
                updated_at: new Date()
            })
            .eq('user_id', userId);

        if (error) {
            console.error('Update Error:', error);
            return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
