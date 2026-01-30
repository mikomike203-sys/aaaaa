'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Briefcase,
    Code,
    CheckCircle,
    Clock,
    Send,
    FileCode,
    Terminal,
    MessageCircle,
    MoreVertical,
    Zap,
    Rocket
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function DeveloperJobsPage() {
    const { data: session } = useSession();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch('/api/projects');
                const result = await response.json();
                if (result.success) {
                    setJobs(result.data);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchJobs();
        }
    }, [session]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Active Work Queue</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage your assignments, submit milestones, and track your performance.</p>
                </div>
                <div className="flex gap-3">
                    <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100 flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Availability: Active
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading ? (
                    Array(2).fill(0).map((_, i) => (
                        <Card key={i} className="p-8 animate-pulse space-y-6">
                            <div className="h-8 bg-gray-50 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-50 rounded w-full"></div>
                            <div className="h-20 bg-gray-50 rounded w-full"></div>
                        </Card>
                    ))
                ) : jobs.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Rocket className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Queue is empty</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            No projects are currently assigned to you. Once an admin assigns you a job, it will appear here.
                        </p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <Card key={job.id} className="p-0 border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 flex justify-between items-center">
                                <div className="flex items-center gap-4 text-white">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <Code className="w-6 h-6 text-indigo-400 font-bold" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold truncate max-w-[200px]">{job.title}</h3>
                                        <p className="text-xs text-gray-400 font-mono tracking-tighter">PROJECT_ID: {job.id.split('-')[0]}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors">
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-gray-500 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            Milestone Completion
                                        </span>
                                        <span className="text-indigo-600">{job.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                                            style={{ width: `${job.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Status</p>
                                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Verified</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escrow Balance</p>
                                        <p className="font-bold text-gray-900 italic underline decoration-indigo-200">KES {Number(job.total_value).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</p>
                                        <p className="font-bold text-gray-900 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                                            14 Days Left
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Difficulty</p>
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(bit => <div key={bit} className="w-4 h-1 bg-indigo-600 rounded-full" />)}
                                            <div className="w-4 h-1 bg-gray-200 rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-200 group/btn">
                                        <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        Submit Delivery
                                    </button>
                                    <Link
                                        href={`/dashboard/developer/jobs/${job.id}`}
                                        className="flex-1 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-gray-200 hover:bg-gray-50 transition-all"
                                    >
                                        <FileCode className="w-5 h-5" />
                                        Project Portal
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
