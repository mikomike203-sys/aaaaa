'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { CreditCard, Plus, Loader2, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

export default function CommissionerInvoicesPage() {
    const { data: session } = useSession();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        project_id: '',
        amount: '',
        description: '',
        invoice_number: `INV-${Date.now()}`,
        items: [{ description: '', quantity: 1, unit_price: 0, total_price: 0 }]
    });

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        try {
            // 1. Fetch Invoices
            const resInvoices = await fetch('/api/invoices');
            const dataInvoices = await resInvoices.json();
            if (resInvoices.ok) setInvoices(dataInvoices.data);

            // 2. Fetch Projects (for dropdown)
            const resProjects = await fetch('/api/projects');
            const dataProjects = await resProjects.json();
            if (resProjects.ok) setProjects(dataProjects.data);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, unit_price: 0, total_price: 0 }]
        });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].total_price = Number(newItems[index].quantity) * Number(newItems[index].unit_price);
        }

        // Auto-calculate total amount
        const total = newItems.reduce((acc, item) => acc + item.total_price, 0);

        setFormData({ ...formData, items: newItems, amount: total.toString() });
    };

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const selectedProject = projects.find(p => p.id === formData.project_id);
        if (!selectedProject) {
            alert('Please select a valid project');
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: formData.project_id,
                    client_id: selectedProject.client_id,
                    amount: Number(formData.amount),
                    description: formData.description,
                    invoice_number: formData.invoice_number,
                    items: formData.items
                })
            });
            const json = await res.json();

            if (res.ok) {
                alert('Detailed invoice request sent for approval!');
                setShowModal(false);
                setFormData({
                    project_id: '',
                    amount: '',
                    description: '',
                    invoice_number: `INV-${Date.now()}`,
                    items: [{ description: '', quantity: 1, unit_price: 0, total_price: 0 }]
                });
                fetchData();
            } else {
                alert(json.error || 'Failed to create invoice');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating invoice');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending_approval': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-500 mt-2">Manage billing and request payments</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    New Invoice
                </button>
            </div>

            {/* Invoices List */}
            <Card className="overflow-hidden border-none shadow-xl bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5">Invoice #</th>
                                <th className="px-8 py-5">Project</th>
                                <th className="px-8 py-5">Client</th>
                                <th className="px-8 py-5">Amount</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-8 text-center text-gray-400">Loading...</td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-gray-400 italic">
                                        No invoices found. Create your first one!
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 font-mono text-sm font-bold text-gray-700">
                                            {invoice.invoice_number}
                                        </td>
                                        <td className="px-8 py-5 font-medium text-gray-900">
                                            {invoice.project?.title || 'Unknown Project'}
                                        </td>
                                        <td className="px-8 py-5 text-gray-500">
                                            {invoice.client?.name || 'Unknown Client'}
                                        </td>
                                        <td className="px-8 py-5 font-bold text-gray-900">
                                            KES {Number(invoice.amount).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-sm text-gray-500">
                                            {new Date(invoice.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(invoice.status)}`}>
                                                {invoice.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Create New Invoice</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateInvoice} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Project</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.project_id}
                                    onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                                >
                                    <option value="">Select a Project...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.title} (Value: {p.total_value})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Items</label>
                                <div className="space-y-3 mb-4">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2">
                                            <input
                                                className="col-span-6 px-3 py-2 border rounded-lg text-sm"
                                                placeholder="Service"
                                                value={item.description}
                                                onChange={e => updateItem(index, 'description', e.target.value)}
                                            />
                                            <input
                                                className="col-span-2 px-3 py-2 border rounded-lg text-sm"
                                                type="number"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={e => updateItem(index, 'quantity', e.target.value)}
                                            />
                                            <input
                                                className="col-span-4 px-3 py-2 border rounded-lg text-sm"
                                                type="number"
                                                placeholder="Price"
                                                value={item.unit_price}
                                                onChange={e => updateItem(index, 'unit_price', e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <Plus className="w-3 h-3" /> Add Item
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Total Amount (KES)</label>
                                <input
                                    readOnly
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none font-bold text-indigo-600"
                                    placeholder="0.00"
                                    value={formData.amount}
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Calculated automatically from items list.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="What is this invoice for?"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Invoice Number</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    value={formData.invoice_number}
                                    onChange={e => setFormData({ ...formData, invoice_number: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition flex justify-center gap-2 items-center mt-4"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : 'Send for Approval'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
