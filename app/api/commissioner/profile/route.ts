import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'commissioner') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const userId = (session.user as any).id;

        const { error } = await db.supabaseAdmin
            .from('commissioners')
            .update({
                bio: body.bio,
                location: body.location,
                niche_expertise: body.niche_expertise,
                mpesa_number: body.mpesa_number,
                social_links: body.social_links, // e.g. { linkedin: "..." }
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
