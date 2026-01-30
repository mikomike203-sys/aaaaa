"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Users,
    Briefcase,
    MessageSquare,
    MoreVertical,
    Search,
    Filter,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CRMDashboard() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchCRMData();
    }, []);

    async function fetchCRMData() {
        setLoading(true);
        const { data: leadsData } = await supabase
            .from('leads')
            .select(`
                *,
                commissioner:commissioner_id(
                    user_id,
                    users(name)
                )
            `)
            .order('created_at', { ascending: false });

        if (leadsData) setLeads(leadsData);
        setLoading(false);
    }

    async function convertLead(leadId: string) {
        if (!confirm("Convert this lead to an active project?")) return;

        try {
            const res = await fetch('/api/admin/leads/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Lead converted successfully!");
                fetchCRMData();
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to convert lead.");
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'deposit_paid': return 'bg-blue-100 text-blue-700';
            case 'created': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-8 space-y-8 bg-[#fdfdfd] min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">CRM Workspace</h1>
                    <p className="text-slate-500 mt-1">Manage leads, track conversions, and client history.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button className="bg-[#1f7a5a] hover:bg-[#165e44] gap-2">
                        + New Lead
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: "Total Leads", value: leads.length, icon: Users, color: "text-blue-600" },
                    { title: "Active Projects", value: leads.filter(l => l.status === 'active').length, icon: TrendingUp, color: "text-emerald-600" },
                    { title: "Pending Deposit", value: leads.filter(l => l.status === 'deposit_paid').length, icon: Clock, color: "text-amber-600" },
                    { title: "Conversion Rate", value: leads.length > 0 ? `${Math.round((leads.filter(l => l.status === 'active').length / leads.length) * 100)}%` : '0%', icon: CheckCircle2, color: "text-purple-600" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-2 bg-slate-50 rounded-lg ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main CRM View */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 py-4">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-semibold">Leads Pipeline</CardTitle>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1f7a5a]/20 w-64"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Client</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Commissioner</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Budget</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Created</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading leads...</td>
                                    </tr>
                                ) : leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{lead.client_name}</div>
                                            <div className="text-xs text-slate-500">{lead.client_email}</div>
                                        </td>
                                        <td className="px-6 py-4 capitalize text-slate-600 text-sm">
                                            {lead.commissioner?.users?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                            KES {lead.budget?.toLocaleString() || '0'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                                                {lead.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {lead.status !== 'active' && lead.status !== 'closed' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 mr-2"
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        convertLead(lead.id);
                                                    }}
                                                >
                                                    Convert to Project
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="group-hover:text-slate-900 text-slate-400">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Sidebar / Detail Preview placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                <Card className="lg:col-span-2 border-none shadow-sm h-fit">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50">
                        <CardTitle className="text-lg">Project Timeline & Activity</CardTitle>
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {[
                                { type: 'conversion', text: 'Lead converted to active project', client: 'Green School', time: '2 hours ago', icon: Briefcase, color: 'bg-emerald-50 text-emerald-600' },
                                { type: 'payment', text: 'Deposit verified & escrow secured', client: 'M-Gas Portal', time: '5 hours ago', icon: ShieldCheck, color: 'bg-blue-50 text-blue-600' },
                                { type: 'milestone', text: 'Milestone 1 delivered (UX Design)', client: 'Equity Dev', time: 'Yesterday', icon: CheckCircle2, color: 'bg-purple-50 text-purple-600' },
                                { type: 'new_lead', text: 'New project inquiry received', client: 'Aisha J.', time: 'Jan 26', icon: User, color: 'bg-slate-50 text-slate-600' }
                            ].map((event, i) => (
                                <div key={i} className="flex gap-4 p-6 hover:bg-slate-50/30 transition-colors">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${event.color}`}>
                                        <event.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-semibold text-slate-900">{event.text}</p>
                                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 uppercase">
                                                <Clock className="w-3 h-3" /> {event.time}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Project: <span className="font-medium text-slate-700">{event.client}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-[#1f7a5a] text-white">
                        <CardContent className="p-8">
                            <ShieldCheck className="w-8 h-8 mb-4 opacity-50" />
                            <h3 className="text-xl font-bold">Escrow Oversight</h3>
                            <p className="mt-2 text-[#e6f4ea] text-sm leading-relaxed">Total volume currently held in escrow across all active projects.</p>
                            <div className="mt-6 flex items-baseline gap-2">
                                <span className="text-3xl font-bold">KES 1.4M</span>
                                <span className="text-xs text-[#e6f4ea] opacity-80">+12% from last month</span>
                            </div>
                            <Button className="mt-6 w-full bg-white text-[#1f7a5a] hover:bg-[#e6f4ea] font-bold">
                                View Finance Ledger
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Quick Reminders</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-900 font-medium">3 client KYC documents pending verification</p>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <MessageSquare className="w-5 h-5 text-blue-600 shrink-0" />
                                <p className="text-xs text-blue-900 font-medium">Verify milestone for 'Green School'</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
