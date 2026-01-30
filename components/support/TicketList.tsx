'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    MessageSquare,
    Plus,
    Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Ticket {
    id: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    created_at: string;
    sender: { name: string; role: string };
}

export default function TicketList({ role }: { role: string }) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetch('/api/support/tickets')
            .then(res => res.json())
            .then(data => {
                if (data.success) setTickets(data.data);
                setLoading(false);
            });
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 font-bold';
            case 'high': return 'text-orange-600 font-semibold';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
                {role !== 'admin' && (
                    <Link href={`/dashboard/${role.toLowerCase()}/support/new`}>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                            <Plus className="w-4 h-4" />
                            New Ticket
                        </button>
                    </Link>
                )}
            </div>

            <Card className="overflow-hidden border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading tickets...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No tickets found.</td></tr>
                            ) : (
                                tickets.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{ticket.subject}</div>
                                            {role === 'admin' && <div className="text-xs text-gray-400">By {ticket.sender?.name}</div>}
                                        </td>
                                        <td className="px-6 py-4 capitalize">{ticket.category}</td>
                                        <td className={`px-6 py-4 capitalize ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <Link href={`/dashboard/${role.toLowerCase()}/support/${ticket.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
