
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;

    const { data: settings, error } = await supabaseAdmin
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Default settings if none found
    const defaultSettings = {
        theme: 'system',
        notifications_enabled: true,
        email_frequency: 'immediate',
        language: 'en',
        timezone: 'Africa/Nairobi'
    };

    return NextResponse.json({ success: true, data: settings || defaultSettings });
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();

    const { data, error } = await supabaseAdmin
        .from('user_settings')
        .upsert({
            user_id: userId,
            ...body,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
}
