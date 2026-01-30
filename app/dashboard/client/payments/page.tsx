'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    CreditCard,
    DollarSign,
    CheckCircle,
    Clock,
    Download,
    Receipt,
    ExternalLink,
    Wallet,
    Mail,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ClientPaymentsPage() {
    const { data: session } = useSession();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceEmail, setInvoiceEmail] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [submittingEmail, setSubmittingEmail] = useState(false);

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

    const handleRequestInvoice = (payment: any) => {
        setSelectedPayment(payment);
        setInvoiceEmail((session?.user as any)?.email || '');
        setShowInvoiceModal(true);
    };

    const handleSubmitEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingEmail(true);

        try {
            const response = await fetch('/api/invoices/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_id: selectedPayment.id,
                    email: invoiceEmail,
                }),
            });

            if (response.ok) {
                alert('Invoice request submitted! You will receive the invoice via email shortly.');
                setShowInvoiceModal(false);
            } else {
                alert('Failed to submit invoice request');
            }
        } catch (error) {
            console.error('Error submitting invoice request:', error);
            alert('Error submitting request');
        } finally {
            setSubmittingEmail(false);
        }
    };

    const totalInvested = payments
        .filter(p => p.status === 'verified' || p.status === 'released')
        .reduce((acc, p) => acc + Number(p.amount), 0);

    const inEscrow = payments
        .filter(p => p.status === 'verified')
        .reduce((acc, p) => acc + Number(p.amount), 0);

    const pendingRelease = payments
        .filter(p => p.status === 'pending_release')
        .reduce((acc, p) => acc + Number(p.amount), 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Billing & Payments</h1>
                    <p className="text-[var(--text-secondary)] mt-2">Manage your project funds, escrow deposits, and view invoices.</p>
                </div>
                <button className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg">
                    <Wallet className="w-5 h-5" />
                    Top Up Escrow
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-[var(--bg-card)] border-[var(--bg-input)] shadow-sm">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium">Total Invested</p>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">KES {totalInvested.toLocaleString()}</h3>
                </Card>
                <Card className="p-6 bg-[var(--bg-card)] border-[var(--bg-input)] shadow-sm">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium">In Escrow</p>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">KES {inEscrow.toLocaleString()}</h3>
                </Card>
                <Card className="p-6 bg-[var(--bg-card)] border-[var(--bg-input)] shadow-sm">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Receipt className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium">Active Invoices</p>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">{payments.filter(p => p.status === 'pending').length}</h3>
                </Card>
                <Card className="p-6 bg-[var(--bg-card)] border-[var(--bg-input)] shadow-sm">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium">Pending Release</p>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">KES {pendingRelease.toLocaleString()}</h3>
                </Card>
            </div>

            {/* Transaction History */}
            <Card className="overflow-hidden border-[var(--bg-input)]">
                <div className="p-6 border-b border-[var(--bg-input)] flex justify-between items-center bg-[var(--bg-input)]/30">
                    <h3 className="font-bold text-[var(--text-primary)]">Payment History</h3>
                    <div className="flex gap-2">
                        <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--bg-input)] rounded-lg">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--bg-card)] border-b border-[var(--bg-input)]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Transaction</th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Project</th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--bg-input)] bg-[var(--bg-card)]">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-[var(--bg-input)] rounded"></div></td>
                                    </tr>
                                ))
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)] italic">No payments found in your history.</td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-[var(--bg-input)]/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-input)] flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-[var(--text-secondary)]" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--text-primary)]">{payment.payment_reference || 'Deposit'}</p>
                                                    <p className="text-xs text-[var(--text-secondary)]">{new Date(payment.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-[var(--text-secondary)]">{payment.projects?.title || 'General Account'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[var(--text-primary)]">KES {Number(payment.amount).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${payment.status === 'verified' ? 'bg-green-100 text-green-700' :
                                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRequestInvoice(payment)}
                                                className="text-[var(--primary)] text-sm font-bold flex items-center justify-end gap-1 ml-auto hover:underline"
                                            >
                                                Request Invoice
                                                <Mail className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Invoice Email Modal */}
            {showInvoiceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full p-8">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Request Invoice</h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Enter your email to receive the invoice for this transaction.
                        </p>
                        <form onSubmit={handleSubmitEmail}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={invoiceEmail}
                                    onChange={(e) => setInvoiceEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowInvoiceModal(false)}
                                    className="flex-1 px-6 py-3 border border-[var(--bg-input)] rounded-xl hover:bg-[var(--bg-input)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingEmail}
                                    className="flex-1 btn-primary px-6 py-3 rounded-xl flex items-center justify-center gap-2"
                                >
                                    {submittingEmail ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Invoice'
                                    )}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
