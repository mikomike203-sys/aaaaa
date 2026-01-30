'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    CreditCard,
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle,
    Search,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AdminPaymentsPage() {
    const { data: session } = useSession();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await fetch('/api/payments');
                const result = await response.json();
                if (result.success) {
                    setPayments(result.data);
                }
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchPayments();
        }
    }, [session]);

    const stats = {
        total: payments.reduce((acc, p) => acc + Number(p.amount), 0),
        pending: payments.filter(p => p.status === 'pending').length,
        verified: payments.filter(p => p.status === 'verified').length,
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payments & Escrow</h1>
                <p className="text-gray-500 mt-2">Monitor financial health and manage escrow releases.</p>
            </div>

            {/* Financial Overview Tags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-indigo-600 text-white border-none shadow-lg shadow-indigo-200">
                    <p className="text-indigo-100 font-medium">Platform Volume</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-bold">KES {stats.total.toLocaleString()}</h3>
                        <DollarSign className="w-8 h-8 opacity-20" />
                    </div>
                </Card>
                <Card className="p-6">
                    <p className="text-gray-500 font-medium">Pending Verification</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-bold text-orange-600">{stats.pending}</h3>
                        <Clock className="w-8 h-8 text-orange-200" />
                    </div>
                </Card>
                <Card className="p-6">
                    <p className="text-gray-500 font-medium">Successful Payments</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-bold text-green-600">{stats.verified}</h3>
                        <CheckCircle className="w-8 h-8 text-green-200" />
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden border-gray-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                    <div className="flex gap-2">
                        {['all', 'pending', 'verified', 'released'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === s
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    } uppercase tracking-wider`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project / Payer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-1/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-1/3"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-1/4"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-1/2 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No transaction history recorded yet.</td>
                                </tr>
                            ) : (
                                payments
                                    .filter(p => filterStatus === 'all' || p.status === filterStatus)
                                    .map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{payment.projects?.title || 'Unknown Project'}</p>
                                                    <p className="text-xs text-gray-400 font-mono mt-0.5">{payment.payer_id}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 font-bold text-gray-900 transition-transform hover:scale-105 origin-left">
                                                    {payment.status === 'verified' ? <ArrowDownLeft className="w-3 h-3 text-green-500" /> : <ArrowUpRight className="w-3 h-3 text-orange-500" />}
                                                    KES {Number(payment.amount).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${payment.status === 'verified' ? 'bg-green-100 text-green-700' :
                                                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${payment.status === 'verified' ? 'bg-green-500' :
                                                            payment.status === 'pending' ? 'bg-yellow-500' :
                                                                'bg-gray-500'
                                                        }`} />
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                    {payment.payment_reference || payment.id.split('-')[0]}
                                                </span>
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
