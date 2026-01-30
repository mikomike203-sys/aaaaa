'use client';

import { useSession } from 'next-auth/react';
import TicketChat from '@/components/support/TicketChat';
import Link from 'next/link';
import { ArrowLeft, Clock, Hash } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TicketDetailView({ id, role }: { id: string, role: string }) {
    const { data: session } = useSession();
    const [ticket, setTicket] = useState<any>(null);

    useEffect(() => {
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
            <Link href={`/dashboard/${role}/support`} className="flex items-center text-gray-500 hover:text-gray-900 transition">
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
                        {role === 'admin' && <span className="font-bold text-indigo-600">User: {ticket.sender?.name}</span>}
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
