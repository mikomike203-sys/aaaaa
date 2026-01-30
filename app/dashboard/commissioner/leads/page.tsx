'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Users,
    Share2,
    CheckCircle,
    Clock,
    UserPlus,
    Search,
    ChevronRight,
    Target,
    Plus,
    X,
    MessageSquare,
    Briefcase
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LeadBarChart } from '@/components/ui/charts';
import { useRouter } from 'next/navigation';

export default function CommissionerLeadsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'public' | 'mine'>('public');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        client_name: '',
        client_email: '',
        client_phone: '',
        project_summary: '',
        budget: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchLeads = async () => {
        try {
            const response = await fetch('/api/leads'); // Fetches ALL leads (Public Pool)
            const result = await response.json();
            if (result.success) {
                setLeads(result.data);
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchLeads();
        }
    }, [session]);

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    commissioner_id: (session?.user as any)?.commissioner_id, // Ensure this exists or fallback handled in API
                    user_id: (session?.user as any)?.id
                }),
            });

            if (response.ok) {
                // Reset and Refresh
                setIsModalOpen(false);
                setFormData({
                    client_name: '',
                    client_email: '',
                    client_phone: '',
                    project_summary: '',
                    budget: ''
                });
                fetchLeads();
                alert('Lead added to Public Pool!');
            } else {
                alert('Failed to create lead.');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating lead.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogContact = async (leadId: string) => {
        try {
            const res = await fetch('/api/leads/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId })
            });
            if (res.ok) {
                alert('Contact Logged! This lead is now secured.');
                fetchLeads();
            } else {
                alert('Failed to log contact');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleClaimLead = async (leadId: string) => {
        if (!confirm('Are you sure you want to claim this lead? You have a limited capacity of 3 active leads.')) return;

        try {
            const res = await fetch('/api/leads/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId })
            });
            const json = await res.json();

            if (res.ok) {
                alert(json.message || 'Lead claimed successfully!');
                fetchLeads();
                setActiveTab('mine'); // Switch to My Leads tab
            } else {
                alert(json.message || 'Failed to claim lead');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while claiming the lead');
        }
    };

    const myCommId = (session?.user as any)?.commissioner_id;

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.client_email?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === 'public') {
            // Public pool: Unclaimed leads
            return !lead.claimed_by;
        } else {
            // My Leads: Claimed by me
            return lead.claimed_by === myCommId;
        }
    });

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] tracking-tight">
                        {activeTab === 'public' ? 'Public Lead Pool' : 'My Active Leads'}
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        {activeTab === 'public'
                            ? 'View available leads and add new ones to the pool.'
                            : 'Manage your claimed leads and secure them by logging contact.'}
                    </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto items-center">
                    <div className="flex bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--bg-input)]">
                        <button
                            onClick={() => setActiveTab('public')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'public' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)]'}`}
                        >
                            Public Pool
                        </button>
                        <button
                            onClick={() => setActiveTab('mine')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'mine' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)]'}`}
                        >
                            My Leads
                        </button>
                    </div>

                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-[var(--bg-input)] rounded-2xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden md:inline">Add Lead</span>
                    </button>
                </div>
            </div>

            {/* Performance Chart Area - Only show on Public Tab for now */}
            {activeTab === 'public' && (
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="md:col-span-2 p-8 border-none bg-[var(--bg-card)] shadow-xl shadow-green-900/5 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl group-hover:scale-110 transition-transform"></div>
                        <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest mb-2">Pool Velocity</h3>
                        <p className="text-xs text-[var(--text-secondary)] font-medium mb-6">New leads added to the pool (7 days)</p>
                        <LeadBarChart />
                    </Card>

                    <Card className="p-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white border-none shadow-xl shadow-indigo-500/20 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Total Pool Value</h3>
                            <p className="text-white/80 text-sm opacity-80 mt-1">Estimated Budget</p>
                        </div>
                        <div className="py-8">
                            <h2 className="text-4xl font-black">
                                KES {leads.filter(l => !l.claimed_by).reduce((sum, l) => sum + (Number(l.budget) || 0), 0).toLocaleString()}
                            </h2>
                            <p className="text-white/60 text-xs font-bold mt-2 uppercase tracking-widest italic">Across {leads.filter(l => !l.claimed_by).length} Available Leads</p>
                        </div>
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-bold text-xs uppercase tracking-widest border border-white/20">
                            View Analytics
                        </button>
                    </Card>
                </div>
            )}

            {/* Leads Table Card */}
            <Card className="overflow-hidden border-[var(--bg-input)] shadow-xl shadow-gray-900/5 bg-[var(--bg-card)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--bg-app)] border-b border-[var(--bg-input)]">
                            <tr>
                                <th className="px-8 py-5 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Contact</th>
                                <th className="px-8 py-5 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Budget</th>
                                <th className="px-8 py-5 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Phone</th>
                                <th className="px-8 py-5 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Added By</th>
                                <th className="px-8 py-5 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--bg-input)] bg-[var(--bg-card)]">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-6"><div className="h-5 bg-[var(--bg-input)] rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="w-16 h-16 bg-[var(--bg-input)] rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Target className="w-8 h-8 text-[var(--text-secondary)]" />
                                        </div>
                                        <p className="text-[var(--text-secondary)] font-medium italic">
                                            {activeTab === 'public'
                                                ? 'No leads in the pool yet. Be the first to add one!'
                                                : 'You haven\'t claimed any leads yet. Check the Public Pool!'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const isMyLead = lead.claimed_by && (session?.user as any)?.commissioner_id === lead.claimed_by;
                                    const isClaimable = !lead.claimed_by && activeTab === 'public';

                                    return (
                                        <tr key={lead.id} className="group hover:bg-[var(--bg-app)] transition-all duration-300">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center font-bold text-[var(--primary)] transition-transform group-hover:scale-110">
                                                        {lead.client_name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                                                            {isMyLead ? lead.client_name : (lead.client_name.split(' ')[0] + '...')}
                                                        </p>
                                                        <p className="text-xs text-[var(--text-secondary)] max-w-xs truncate">{lead.project_summary || 'No summary'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-[var(--text-primary)]">
                                                    {lead.budget ? `KES ${Number(lead.budget).toLocaleString()}` : 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm text-[var(--text-secondary)]">
                                                    {isMyLead ? (lead.client_phone || 'Not provided') : 'Locked'}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${lead.status === 'converted' ? 'bg-green-500/10 text-green-500' :
                                                    lead.status === 'contacted' ? 'bg-blue-500/10 text-blue-500' :
                                                        lead.claimed_by ? 'bg-purple-500/10 text-purple-500' :
                                                            'bg-green-500/10 text-green-600'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${lead.status === 'converted' ? 'bg-green-500' :
                                                        lead.claimed_by ? 'bg-purple-500' : 'bg-green-500'
                                                        }`} />
                                                    {lead.claimed_by ? (isMyLead ? (lead.status === 'claimed' ? 'Claimed - Contact Pending' : 'Contacted') : 'Claimed') : 'Open'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-[var(--text-secondary)]">
                                                {lead.commissioner?.user?.name || 'Pool'}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {isClaimable ? (
                                                    <button
                                                        onClick={() => handleClaimLead(lead.id)}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                                                    >
                                                        Claim Lead
                                                    </button>
                                                ) : isMyLead && lead.status === 'claimed' ? (
                                                    <button
                                                        onClick={() => handleLogContact(lead.id)}
                                                        className="px-4 py-2 border border-blue-200 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                                                    >
                                                        Log Contact
                                                    </button>
                                                ) : isMyLead ? (
                                                    <button className="px-4 py-2 border border-gray-200 text-gray-400 rounded-xl text-xs font-bold cursor-default">
                                                        Secured
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Unavailable</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create Lead Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[var(--bg-card)] w-full max-w-lg rounded-3xl shadow-2xl border border-[var(--bg-input)] animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-[var(--bg-input)] flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Add Lead to Pool</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--bg-input)] rounded-full text-[var(--text-secondary)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLead} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Client Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--bg-input)] bg-[var(--bg-app)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                                    placeholder="e.g. John Doe"
                                    value={formData.client_name}
                                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Budget (KES)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--bg-input)] bg-[var(--bg-app)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                                        placeholder="0.00"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--bg-input)] bg-[var(--bg-app)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                                        placeholder="07..."
                                        value={formData.client_phone}
                                        onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Project Summary</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--bg-input)] bg-[var(--bg-app)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                                    placeholder="Brief description of the project..."
                                    value={formData.project_summary}
                                    onChange={(e) => setFormData({ ...formData, project_summary: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-input)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-[var(--primary)] text-white hover:brightness-110 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                                >
                                    {submitting ? 'Adding...' : 'Add to Pool'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

