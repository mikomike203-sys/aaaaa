'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import {
    Users,
    Link2,
    Share2,
    CheckCircle,
    Clock,
    UserPlus,
    Copy,
    Search,
    ChevronRight,
    TrendingUp,
    AlertTriangle,
    Mail
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LeadBarChart } from '@/components/ui/charts';
import { NewLeadModal } from '@/components/dashboard/NewLeadModal';
import { CreateInvoiceModal } from '@/components/dashboard/CreateInvoiceModal';

export default function CommissionerDashboard() {
    const { data: session } = useSession();
    const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

    // State for modal


    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Commissioner Overview</h2>
                    <p className="text-gray-500 mt-2 text-lg">Manage your digital agency pipeline and client relationships.</p>
                </div>
                <button
                    onClick={() => setIsInvoiceOpen(true)}
                    className="bg-indigo-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all flex items-center gap-2"
                >
                    <Mail className="w-4 h-4" />
                    New Invoice
                </button>
            </div>

            {/* Quick Stats with "At Risk" Logic */}
            <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6 border-none shadow-xl shadow-indigo-100/50 bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 opacity-50 blur-xl group-hover:scale-110 transition-transform"></div>
                    <div className="relative">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Active Projects</p>
                        <h3 className="text-4xl font-black text-gray-900">12</h3>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md">
                            <TrendingUp className="w-3 h-3" />
                            <span>On Track</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-2 border-yellow-100 shadow-none bg-yellow-50/30 relative">
                    <div className="absolute top-3 right-3 animate-pulse">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    </div>
                    <p className="text-xs font-black text-yellow-600 uppercase tracking-widest mb-1">Attention Needed</p>
                    <h3 className="text-4xl font-black text-gray-900">3</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-yellow-700 bg-yellow-100 w-fit px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" />
                        <span>Approaching Deadline</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-xl shadow-red-100/50 bg-white group">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">At Risk</p>
                    <h3 className="text-4xl font-black text-gray-900">1</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 w-fit px-2 py-1 rounded-md">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Client Approval Late</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-lg bg-indigo-600 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700"></div>
                    <div className="relative z-10">
                        <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-1">Total Revenue</p>
                        <h3 className="text-4xl font-black text-white">KES 2.4M</h3>
                        <p className="text-xs text-indigo-200 mt-4">+18% this month</p>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Fast Onboarding Section - NOW "New Lead" Action */}
                <Card className="lg:col-span-1 p-8 border-gray-100 shadow-xl shadow-indigo-100/20 max-h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-tight">New Client Lead</h3>
                            <p className="text-xs text-gray-400 font-medium">Create custom quotes instantly</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Onboard a new client by generating a professional project proposal link. They can review, schedule a meeting, and pay the deposit securely.
                        </p>

                        <button
                            onClick={() => setIsNewLeadOpen(true)}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                        >
                            <Mail className="w-4 h-4" />
                            Create New Lead
                        </button>
                    </div>
                </Card>

                {/* Leads & Clients Panel (New Spec) */}
                <Card className="lg:col-span-3 p-0 border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-400" />
                            Recent Leads
                        </h3>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">
                            View Pipeline
                        </button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {/* Mock Data for Leads - will connect to API later */}
                        {[
                            { name: 'Sarah K.', project: 'E-commerce Redesign', status: 'Meeting Scheduled', date: '2h ago', color: 'bg-blue-100 text-blue-700' },
                            { name: 'David M.', project: 'Mobile App MVP', status: 'Proposal Sent', date: '5h ago', color: 'bg-yellow-100 text-yellow-700' },
                            { name: 'TechCorp Ltd.', project: 'Internal Dashboard', status: 'Deposit Paid', date: '1d ago', color: 'bg-green-100 text-green-700' },
                        ].map((lead, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                        {lead.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{lead.name}</h4>
                                        <p className="text-xs text-gray-500">{lead.project}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${lead.color}`}>
                                        {lead.status}
                                    </span>
                                    <span className="text-xs text-gray-400">{lead.date}</span>
                                    <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-indigo-600">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Performance Chart with Context */}
                <Card className="lg:col-span-2 p-8 border-none bg-white shadow-xl shadow-green-100/30 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-1">Direct Intake Velocity</h3>
                            <p className="text-xs text-gray-400 font-medium">Referral conversion performance over the last 7 days</p>
                        </div>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                            View Full Report <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    <LeadBarChart />
                </Card>
                {/* New Lead Modal */}
                <NewLeadModal isOpen={isNewLeadOpen} onClose={() => setIsNewLeadOpen(false)} />

                {/* Invoice Modal */}
                <CreateInvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} />
            </div>
        </div>
    );
}
