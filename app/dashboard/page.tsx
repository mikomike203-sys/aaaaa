'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingTriangle from '@/components/ui/loading-triangle';

export default function DashboardEntryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            const role = (session?.user as any)?.role || 'client';

            // Route based on role
            switch (role) {
                case 'admin':
                    router.push('/dashboard/admin');
                    break;
                case 'commissioner':
                    router.push('/dashboard/commissioner');
                    break;
                case 'developer':
                    router.push('/dashboard/developer');
                    break;
                case 'client':
                default:
                    router.push('/dashboard/client');
                    break;
            }
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, session, router]);

    return <LoadingTriangle />;
}
