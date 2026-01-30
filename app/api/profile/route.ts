// API Route: Get and Update User Profile
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Fetch user profile
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        // Fetch role-specific data if commissioner or developer
        let additionalData = {};

        if (user.role === 'commissioner') {
            const { data: commissioner } = await supabaseAdmin
                .from('commissioners')
                .select('mpesa_number, referral_code, tier')
                .eq('user_id', userId)
                .single();

            additionalData = commissioner || {};
        } else if (user.role === 'developer') {
            const { data: developer } = await supabaseAdmin
                .from('developers')
                .select('skills, hourly_rate, portfolio_url, availability_status')
                .eq('user_id', userId)
                .single();

            additionalData = developer || {};
        }

        return NextResponse.json({
            success: true,
            data: {
                ...user,
                ...additionalData,
            },
        });
    } catch (error: any) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await request.json();

        const {
            name,
            phone,
            bio,
            avatar_url,
            company,
            industry,
            skills,
            hourly_rate,
            portfolio_url,
            mpesa_number,
        } = body;

        // Update users table
        const { error: userError } = await supabaseAdmin
            .from('users')
            .update({
                name,
                phone,
                bio,
                avatar_url,
                company,
                industry,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (userError) throw userError;

        // Update role-specific tables
        const userRole = (session.user as any).role;

        if (userRole === 'commissioner' && mpesa_number) {
            await supabaseAdmin
                .from('commissioners')
                .update({ mpesa_number })
                .eq('user_id', userId);
        } else if (userRole === 'developer') {
            await supabaseAdmin
                .from('developers')
                .update({
                    skills,
                    hourly_rate: hourly_rate ? parseFloat(hourly_rate) : null,
                    portfolio_url,
                })
                .eq('user_id', userId);
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
        });
    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update profile' },
            { status: 500 }
        );
    }
}
