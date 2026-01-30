// Developer Dashboard
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Briefcase, Upload, Clock, CheckCircle, AlertTriangle, Wallet, Activity, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DeveloperDashboard() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/developer/dashboard');
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                }
            } catch (error) {
                console.error('Error fetching developer dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchData();
        }
    }, [session]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Compiling Dashboard</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-12 text-center bg-red-50 rounded-3xl border border-red-100">
                <p className="text-red-600 font-bold">Failed to initialize workspace data stream.</p>
            </div>
        );
    }

    const { profile, projects } = data;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10 pb-12"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                        Nexus <span className="text-indigo-600">Workspace</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-2 max-w-lg">
                        Welcome, <span className="text-gray-900 font-bold">{session?.user?.name}</span>.
                        Your development squad is currently active on {projects.length} deliverables.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        Availability: ON
                    </button>
                    <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                        Active Mode
                    </button>
                </div>
            </div>

            {/* Metrics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Reliability Score', value: `${profile?.reliability_score || 100}%`, icon: Activity, color: 'indigo' },
                    { label: 'Project Load', value: projects.length, icon: Briefcase, color: 'purple' },
                    { label: 'Escrow Reserve', value: `KES ${Number(profile?.pending_balance || 0).toLocaleString()}`, icon: Clock, color: 'amber' },
                    { label: 'Liquid Wallet', value: `KES ${Number(profile?.available_balance || 0).toLocaleString()}`, icon: Wallet, color: 'emerald' },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="card-soft p-8 relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${metric.color}-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700`} />

                        <div className="relative z-10 space-y-4">
                            <div className={`w-12 h-12 rounded-2xl bg-${metric.color}-50 flex items-center justify-center text-${metric.color}-600`}>
                                <metric.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{metric.label}</p>
                                <p className={`text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors`}>
                                    {metric.value}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Projects Container */}
            <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Deployment Pipeline</h2>
                    </div>
                </div>

                <div className="grid gap-6">
                    {projects.length === 0 ? (
                        <div className="p-20 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
                            <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active nodes detected in squad pipeline</p>
                        </div>
                    ) : (
                        projects.map((project: any) => (
                            <motion.div
                                key={project.id}
                                whileHover={{ scale: 1.01 }}
                                className="card-soft group cursor-pointer"
                            >
                                <div className="p-8 md:p-10">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                        <div className="flex-1 space-y-6">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                                                    {project.title}
                                                </h3>
                                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${project.role === 'lead' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                        project.role === 'qa' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                            'bg-purple-50 text-purple-700 border-purple-100'
                                                    }`}>
                                                    Squad Position: {project.role}
                                                </span>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Phase</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                                            <Activity className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <span className="text-sm font-black text-gray-800">{project.active_milestone?.title || 'System Idle'}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Temporal Status</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                                            <Clock className="w-5 h-5 text-amber-500" />
                                                        </div>
                                                        <span className={`text-sm font-black ${project.days_remaining < 3 ? 'text-red-600' : 'text-gray-800'}`}>
                                                            {project.days_remaining || '∞'} Days Remaining
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-3 pt-2">
                                                <Link
                                                    href={`/dashboard/developer/projects/${project.id}`}
                                                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 group/btn"
                                                >
                                                    Access Node <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                                </Link>
                                                <button className="px-6 py-3 bg-white border border-gray-100 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                                                    Telemetry Data
                                                </button>
                                            </div>
                                        </div>

                                        <div className="lg:w-72 space-y-4">
                                            <div className="p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Phase Saturation</p>
                                                <div className="relative w-32 h-32 mx-auto">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="64" cy="64" r="58" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                                        <motion.circle
                                                            cx="64" cy="64" r="58" fill="none" stroke="#6366f1" strokeWidth="12"
                                                            strokeDasharray={`${2 * Math.PI * 58}`}
                                                            initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                                                            animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - (project.active_milestone?.percent_amount || 0) / 100) }}
                                                            strokeLinecap="round"
                                                            transition={{ duration: 2, ease: "easeOut" }}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-xl font-black text-gray-900">{project.active_milestone?.percent_amount || 0}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )
                    }
                </div>
            </motion.div>
        </motion.div>
    );
}
