'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    DollarSign,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    PieChart,
    ChevronRight,
    Search,
    Download,
    CreditCard,
    Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function CommissionerEarningsPage() {
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

    const totalEarned = earnings.reduce((acc, e) => acc + Number(e.amount), 0);
    const pendingEarnings = 0; // Logic for pending commissions could go here

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500">
                        Earnings & Financials
                    </h1>
                    <p className="text-gray-500 mt-2">Oversee your commission portfolio and payout history.</p>
                </div>
                <button className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 hover:-translate-y-1">
                    <Download className="w-5 h-5" />
                    Export Report
                </button>
            </div>

            {/* Premium Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 bg-gradient-to-br from-[#1f7a5a] to-[#176549] text-white border-none shadow-2xl shadow-green-200/50 group overflow-hidden relative">
                    <TrendingUp className="absolute right-[-10px] bottom-[-10px] w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
                    <p className="text-green-100/80 font-bold uppercase tracking-widest text-xs mb-4">Total Revenue Generated</p>
                    <h3 className="text-4xl font-black">KES {totalEarned.toLocaleString()}</h3>
                    <div className="mt-6 flex items-center gap-2 text-green-100 text-sm font-medium">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>+12.5% from last month</span>
                    </div>
                </Card>

                <Card className="p-8 border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">Locked Commissions</p>
                    <h3 className="text-4xl font-black text-gray-900">KES {pendingEarnings.toLocaleString()}</h3>
                    <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Awaiting project milestone verification
                    </p>
                </Card>

                <Card className="p-8 border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">Conversion Rate</p>
                    <h3 className="text-4xl font-black text-indigo-600">68%</h3>
                    <div className="mt-6 w-full bg-indigo-50 rounded-full h-2">
                        <div className="bg-indigo-600 h-full rounded-full w-[68%]"></div>
                    </div>
                </Card>
            </div>

            {/* Earnings Breakdown */}
            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 overflow-hidden border-gray-100">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                        <h3 className="font-bold text-gray-900">Referral Breakdown</h3>
                        <div className="flex gap-2">
                            <button className="text-xs font-bold text-[#1f7a5a] hover:underline uppercase tracking-wider">View All</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Project</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Commission</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse"><td colSpan={4} className="p-6"><div className="h-4 bg-gray-50 rounded"></div></td></tr>
                                    ))
                                ) : earnings.length === 0 ? (
                                    <tr><td colSpan={4} className="p-12 text-center text-gray-400 italic">No earnings data available.</td></tr>
                                ) : (
                                    earnings.map((earning) => (
                                        <tr key={earning.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-gray-900">{earning.projects?.title || 'Unknown Project'}</p>
                                                <p className="text-xs text-gray-400">Total Value: KES {Number(earning.projects?.total_value || 0).toLocaleString()}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-[#1f7a5a]">KES {Number(earning.amount).toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{earning.commission_type}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${earning.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {earning.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button className="p-2 hover:bg-white rounded-lg transition-all group-hover:scale-110">
                                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <div className="space-y-8">
                    <Card className="p-8 bg-indigo-50 border-indigo-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <CreditCard className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h4 className="font-bold text-gray-900">Payout Method</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">Your commissions are sent to the primary M-Pesa account on file.</p>
                        <div className="p-4 bg-white rounded-2xl border border-indigo-100 mb-6">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Account</p>
                            <p className="font-bold text-gray-900 mt-1">M-Pesa: +254 7****283</p>
                        </div>
                        <button className="w-full py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all">
                            Manage Methods
                        </button>
                    </Card>

                    <Card className="p-8 border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-gray-400" />
                            Revenue Mix
                        </h4>
                        <div className="space-y-4">
                            {[
                                { label: 'Web Development', value: 75, color: 'bg-green-500' },
                                { label: 'Mobile Apps', value: 15, color: 'bg-indigo-500' },
                                { label: 'Consultancy', value: 10, color: 'bg-orange-500' },
                            ].map((item) => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-gray-500">{item.label}</span>
                                        <span className="text-gray-900">{item.value}%</span>
                                    </div>
                                    <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                                        <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.value}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
