'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { supabaseClient } from '@/lib/db';
import { FileText, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';

export default function AdminLedgerPage() {
    const { data: session } = useSession();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLedger = async () => {
            try {
                // Fetch all ledger entries
                const { data, error } = await supabaseClient
                    .from('escrow_ledger')
                    .select(`
                        *,
                        project:projects(title)
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setEntries(data || []);
            } catch (error) {
                console.error('Error fetching ledger:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchLedger();
        }
    }, [session]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Escrow Ledger</h1>
                <p className="text-gray-500 mt-2">Immutable record of all funds moving in and out of escrow.</p>
            </div>

            <Card className="overflow-hidden border-gray-100">
                <div className="p-6 border-b border-gray-100 bg-white">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        All Transactions
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Balance After</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--primary)]" />
                                    </td>
                                </tr>
                            ) : entries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">No ledger entries found.</td>
                                </tr>
                            ) : (
                                entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(entry.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{entry.project?.title || 'System'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {entry.description}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-1 font-bold ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {entry.amount >= 0 ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                KES {Math.abs(Number(entry.amount)).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                {entry.transaction_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                                            KES {Number(entry.balance_after).toLocaleString()}
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
