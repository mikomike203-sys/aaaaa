'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    DollarSign,
    PiggyBank,
    ArrowUpRight,
    CreditCard,
    History,
    CheckCircle,
    Clock,
    Download,
    BarChart3,
    ShieldCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function DeveloperEarningsPage() {
    const { data: session } = useSession();
    const [earnings, setEarnings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await fetch('/api/earnings');
                const result = await response.json();
                if (result.success) {
                    setEarnings(result.data);
                }
            } catch (error) {
                console.error('Error fetching earnings:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchEarnings();
        }
    }, [session]);

    const totalEarned = earnings
        .filter(e => e.status === 'paid')
        .reduce((acc, e) => acc + Number(e.amount), 0);

    const pendingPayout = earnings
        .filter(e => e.status === 'pending')
        .reduce((acc, e) => acc + Number(e.amount), 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Earnings & Payouts</h1>
                    <p className="text-gray-500 mt-2 font-medium">Track your income, request payouts, and manage your billing information.</p>
                </div>
                <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                    <CreditCard className="w-5 h-5" />
                    Request Payout
                </button>
            </div>

            {/* Financial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="p-8 border-none bg-indigo-600 text-white shadow-2xl shadow-indigo-200 group relative overflow-hidden">
                    <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-indigo-100 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Total Realized Revenue</p>
                    <h3 className="text-4xl font-black">KES {totalEarned.toLocaleString()}</h3>
                    <div className="mt-8 flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="text-xs font-bold font-mono">+ KES 12,500 pending</span>
                    </div>
                </Card>

                <Card className="p-8 border-gray-100 shadow-sm hover:shadow-lg transition-all">
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Pending Payouts</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-4xl font-black text-gray-900 font-mono">KES {pendingPayout.toLocaleString()}</h3>
                        <Clock className="w-8 h-8 text-orange-200" />
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-gray-300" />
                        Secured by Escrow
                    </div>
                </Card>

                <Card className="p-8 border-gray-100 shadow-sm hover:shadow-lg transition-all border-dashed">
                    <div className="h-full flex flex-col justify-between">
                        <div>
                            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Payout Schedule</p>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">Bi-Weekly Settlement</h3>
                        </div>
                        <div className="mt-8 bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <p className="text-xs text-gray-500 font-medium">Next Payout: <span className="text-gray-900 font-bold">Feb 15, 2026</span></p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Detailed Transaction List */}
            <Card className="border-gray-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center">
                    <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-500" />
                        Payout History
                    </h3>
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        CSV Export
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse"><td colSpan={4} className="p-8"><div className="h-4 bg-gray-50 rounded w-full"></div></td></tr>
                                ))
                            ) : earnings.length === 0 ? (
                                <tr><td colSpan={4} className="p-20 text-center text-gray-400 italic">No payout history found. Complete jobs to start earning.</td></tr>
                            ) : (
                                earnings.map((earning) => (
                                    <tr key={earning.id} className="hover:bg-gray-50/20 transition-all font-medium">
                                        <td className="px-8 py-6">
                                            <p className="text-gray-900 font-bold">{earning.projects?.title || 'Unknown Project'}</p>
                                            <p className="text-xs text-gray-400 font-mono italic">{new Date(earning.created_at).toLocaleDateString()} • Milestone Settlement</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-gray-900 font-black">KES {Number(earning.amount).toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${earning.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-500'
                                                }`}>
                                                {earning.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {earning.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <code className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded uppercase">TXN-{earning.id.split('-')[0]}</code>
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
