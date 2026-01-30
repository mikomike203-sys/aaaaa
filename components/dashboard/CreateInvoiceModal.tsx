'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Mail, User, FileText, Banknote, Loader2, Send } from 'lucide-react';

interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateInvoiceModal({ isOpen, onClose }: CreateInvoiceModalProps) {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        client_name: '',
        client_email: '',
        description: '',
        amount: '',
        invoice_number: `INV-${Math.floor(Math.random() * 10000)}` // Mock auto-gen
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                alert(`Invoice Sent Automatically to ${formData.client_email}!`);
                onClose();
                setFormData({
                    client_name: '',
                    client_email: '',
                    description: '',
                    amount: '',
                    invoice_number: `INV-${Math.floor(Math.random() * 10000)}`
                });
            } else {
                alert(`Error: ${result.error || 'Failed to send invoice'}`);
            }

        } catch (error) {
            console.error(error);
            alert('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Create Premium Invoice">
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-800 flex items-center gap-2 mb-4">
                    <Send className="w-4 h-4" />
                    System will generate a Paystack link and email a branded PDF-style invoice.
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Invoice # */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Invoice Number</label>
                        <input
                            type="text"
                            disabled
                            value={formData.invoice_number}
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-mono text-sm"
                        />
                    </div>

                    {/* Client Name */}
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="client_name"
                            required
                            placeholder="Client Name"
                            value={formData.client_name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    {/* Client Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            name="client_email"
                            required
                            placeholder="Client Email"
                            value={formData.client_email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <textarea
                            name="description"
                            required
                            rows={2}
                            placeholder="Service Description (e.g., Web Development Milestone 1)"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Amount */}
                    <div className="relative">
                        <Banknote className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="number"
                            name="amount"
                            required
                            placeholder="Amount (KES)"
                            value={formData.amount}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send Invoice & Pay Link'}
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-3">
                        Sent securely via techdevelopers.co.ke billing system.
                    </p>
                </div>
            </form>
        </Dialog>
    );
}
