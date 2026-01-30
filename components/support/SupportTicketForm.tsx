'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function SupportTicketForm({ role }: { role: string }) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        category: 'general',
        priority: 'medium',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                router.push(`/dashboard/${role.toLowerCase()}/support`);
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <Link href={`/dashboard/${role.toLowerCase()}/support`} className="flex items-center text-gray-500 hover:text-gray-900 transition font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Support Dashboard
            </Link>

            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create New Support Ticket</h1>
                <p className="text-gray-500 mt-2 font-medium">Describe your issue and the Nexus team will get back to you shortly.</p>
            </div>

            <Card className="p-8 border-gray-100 shadow-xl shadow-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                        <input
                            required
                            type="text"
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            placeholder="Brief summary of the issue"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white transition"
                            >
                                <option value="general">General Inquiry</option>
                                <option value="billing">Billing & Payments</option>
                                <option value="technical">Technical Issue</option>
                                <option value="project">Project Dispute</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white transition"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            required
                            rows={6}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition"
                            placeholder="Please provide full details so we can assist you better..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all flex justify-center items-center gap-3 shadow-lg shadow-indigo-100"
                    >
                        {submitting && <Loader2 className="animate-spin w-5 h-5" />}
                        Submit Ticket
                    </button>
                </form>
            </Card>
        </div>
    );
}
