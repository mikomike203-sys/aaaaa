import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Sample commissioners for demo purposes
const SAMPLE_COMMISSIONERS = [
    {
        id: 'sample-1',
        user_id: 'sample-user-1',
        name: 'Sarah Kimani',
        avatar: null,
        bio: 'Full-stack digital lead specializing in scalable web applications and e-commerce platforms. 8+ years building enterprise solutions for fintech and retail.',
        specialties: ['Web App', 'E-commerce', 'React', 'Node.js', 'PostgreSQL'],
        price_range: '150K - 500K KES',
        delivery_time: '4-8 weeks',
        rating: 4.9,
        completed_projects: 47,
        availability: 'available'
    },
    {
        id: 'sample-2',
        user_id: 'sample-user-2',
        name: 'David Omondi',
        avatar: null,
        bio: 'Mobile-first developer and project lead with expertise in React Native and Flutter. Delivered 30+ apps to production across healthcare, logistics, and education sectors.',
        specialties: ['Mobile App', 'React Native', 'Flutter', 'UI/UX', 'Firebase'],
        price_range: '100K - 400K KES',
        delivery_time: '3-6 weeks',
        rating: 4.7,
        completed_projects: 32,
        availability: 'available'
    },
];

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const search = searchParams.get('search');

    try {
        let query = supabase
            .from('commissioners')
            .select(`
                *,
                user:users(id, name, avatar_url)
            `);

        if (category) {
            query = query.contains('specialties', [category]);
        }

        if (search) {
            query = query.ilike('bio', `%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Database query error:', error);
        }

        // Transform database data for the frontend
        let commissioners = (data || []).map(comm => ({
            id: comm.id,
            user_id: comm.user_id,
            name: comm.user?.name || 'Commissioner',
            avatar: comm.user?.avatar_url,
            bio: comm.bio || 'Experienced digital commissioner ready to lead your project.',
            specialties: comm.specialties || ['Web App'],
            price_range: comm.average_price_range || '100K - 300K KES',
            delivery_time: comm.delivery_time_range || '4-8 weeks',
            rating: comm.rating || 4.5,
            completed_projects: comm.completed_count || 10,
            availability: comm.availability_status || 'available'
        }));

        // Add sample commissioners
        commissioners = [...SAMPLE_COMMISSIONERS, ...commissioners];

        // Filter by search term if provided
        if (search) {
            const searchLower = search.toLowerCase();
            commissioners = commissioners.filter(
                c =>
                    c.name.toLowerCase().includes(searchLower) ||
                    c.bio.toLowerCase().includes(searchLower) ||
                    c.specialties.some((s: string) => s.toLowerCase().includes(searchLower))
            );
        }

        // Filter by category if provided and not All
        if (category && category !== 'All') {
            commissioners = commissioners.filter(c =>
                c.specialties.includes(category)
            );
        }

        return NextResponse.json({ success: true, data: commissioners });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
