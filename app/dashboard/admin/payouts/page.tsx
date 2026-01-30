'use client';

import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, AlertTriangle, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabaseClient } from '@/lib/db';
const MOCK_PAYOUTS = [
    {
        id: 101,
        requestor: 'Mark Ochieng',
        role: 'Direct Commissioner',
        amount: 25000,
        project: 'E-commerce Redesign (Proj-102)',
        reason: '25% Direct Commission',
        status: 'pending',
        project_status: 'completed',
        date: '2h ago'
    },
    {
        id: 102,
        requestor: 'Alice Wambui (Parent)',
        role: 'Referrer (Silver)',
        amount: 5000,
        project: 'E-commerce Redesign (Proj-102)',
        reason: '5% Multi-Level Override',
        status: 'pending',
        project_status: 'completed',
        date: '2h ago'
    },
    {
        id: 103,
        requestor: 'Sarah K.',
        role: 'Direct Commissioner',
        amount: 15000,
        project: 'Logo Design (Proj-105)',
        reason: '30% Direct Commission',
        status: 'approved',
        project_status: 'completed',
        date: '1d ago'
    }
];

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                const { data, error } = await supabaseClient
                    .from('commissions')
                    .select(`
                        *,
                        project:projects(title, status),
                        commissioner:commissioners(
                            user:users(name)
                        )
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setPayouts(data || []);
            } catch (error) {
                console.error('Error fetching payouts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayouts();
    }, []);

    const handleApprove = async (id: string, amount: number, commissionerName: string) => {
        if (!confirm(`Approve payout of KES ${amount} to ${commissionerName}?`)) return;

        try {
            const { error } = await supabaseClient
                .from('commissions')
                .update({ status: 'paid', paid_at: new Date() })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p));
            alert('Payout status updated to PAID.');
        } catch (error) {
            console.error('Error approving payout:', error);
            alert('Failed to update payout status.');
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Payout Requests</h2>
                <p className="text-gray-500 mt-2 text-lg">Review and approve commission releases.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-lg bg-white">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Pending Approval</p>
                    <h3 className="text-4xl font-black text-gray-900">
                        KES {payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-yellow-600 bg-yellow-50 w-fit px-2 py-1 rounded-md">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Action Required</span>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden border-none shadow-xl">
                <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Security Check: 35% Hard Cap on Commissions enforced.</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 uppercase tracking-wider font-bold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Requestor</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Reason / Project</th>
                                <th className="px-6 py-4">Project Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin inline" /></td></tr>
                            ) : payouts.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No payouts found.</td></tr>
                            ) : (
                                payouts.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{payout.commissioner?.user?.name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">Commissioner</p>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-gray-900">
                                            KES {Number(payout.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`block text-xs font-bold uppercase tracking-widest mb-1 ${payout.type === 'override' ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                {payout.type || 'Commission'}
                                            </span>
                                            <span className="text-xs text-gray-400">{payout.project?.title}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {payout.project?.status === 'completed' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                                )}
                                                <span className="capitalize text-gray-700">{payout.project?.status || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {payout.status === 'pending' ? (
                                                <button
                                                    onClick={() => handleApprove(payout.id, payout.amount, payout.commissioner?.user?.name)}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-700 transition-colors shadow-md shadow-green-200"
                                                >
                                                    Mark Paid
                                                </button>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-100 rounded-lg">
                                                    Paid
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
