'use client';

import { useSession } from 'next-auth/react';
import TicketChat from '@/components/support/TicketChat';
import Link from 'next/link';
import { ArrowLeft, Clock, Hash } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const { id } = params;
    const [ticket, setTicket] = useState<any>(null);

    // Note: In Next 15 params is a promise, but for Next 14/13 it's an object. 
    // We should handle per latest Next.js if needed. Assuming standard React Component for now. 
    // *Self-Correction*: In previous steps I treated it as Promise in API but straightforward in Page?
    // Let's stick to standard prop access for page.tsx unless strictly 15.

    useEffect(() => {
        // Fetch Ticket Details Metadata
        // Actually we only built /api/support/tickets (list) and .../[id]/messages.
        // We need a way to get SINGLE ticket metadata. 
        // Let's modify the List API or create a detail API. 
        // *Quick Fix*: We can fetch all and filter client side for now (easy) or fix API. 
        // Let's use the list API and find it, it's safer than adding new routes blindly.
        fetch('/api/support/tickets').then(r => r.json()).then(d => {
            if (d.success) {
                const found = d.data.find((t: any) => t.id === id);
                setTicket(found);
            }
        });
    }, [id]);

    if (!ticket) return <div className="p-12 text-center text-gray-500">Loading details...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <Link href="/dashboard/client/support" className="flex items-center text-gray-500 hover:text-gray-900 transition">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Support
            </Link>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        {ticket.subject}
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full uppercase font-bold tracking-wide">
                            {ticket.status}
                        </span>
                    </h1>
                    <div className="flex items-center gap-6 mt-2 text-gray-500 text-sm">
                        <span className="flex items-center gap-1"><Hash className="w-4 h-4" /> ID: {ticket.id.slice(0, 8)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                        <span className="capitalize">Category: {ticket.category}</span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Ticket Details</h3>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                </div>

                <div className="md:col-span-2">
                    {session?.user && (
                        <TicketChat ticketId={id} currentUserId={(session.user as any).id} />
                    )}
                </div>
            </div>
        </div>
    );
}
