'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    Shield,
    ArrowRight,
    MessageSquare,
    FileText,
    Download,
    Plus,
    Users,
    DollarSign,
    Briefcase,
    TrendingUp,
    Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function ClientDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        activeProjects: 0,
        pendingProposals: 0,
        totalInvested: 0,
        teamMembers: 0,
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [projectsRes, paymentsRes] = await Promise.all([
                    fetch('/api/projects'),
                    fetch('/api/payments'),
                ]);

                const projectsData = await projectsRes.json();
                const paymentsData = await paymentsRes.json();

                if (projectsData.success) {
                    const projects = projectsData.data || [];
                    setStats(prev => ({
                        ...prev,
                        activeProjects: projects.filter((p: any) => p.status === 'active').length,
                        pendingProposals: projects.filter((p: any) => p.status === 'pending').length,
                        teamMembers: projects.reduce((acc: number, p: any) =>
                            acc + (p.team_members?.length || 0), 0
                        ),
                    }));
                }

                if (paymentsData.success) {
                    const payments = paymentsData.data || [];
                    const total = payments
                        .filter((p: any) => p.status === 'verified' || p.status === 'released')
                        .reduce((acc: number, p: any) => acc + Number(p.amount), 0);
                    setStats(prev => ({ ...prev, totalInvested: total }));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchDashboardData();
        }
    }, [session]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const userName = (session?.user as any)?.name?.split(' ')[0] || 'there';

    return (
        <div className="space-y-8">
            {/* Personalized Welcome Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black mb-2">
                            {getGreeting()}, {userName}! 👋
                        </h1>
                        <p className="text-indigo-100 text-lg">
                            Ready to bring your next idea to life? Let's make it happen.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/client/new-project"
                        className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Start New Project
                    </Link>
                </div>
            </div>

            {/* Project Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-[var(--bg-card)] border-[var(--bg-input)] shadow-sm hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Briefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Active Projects</p>
                    <h3 className="text-3xl font-bold text-[var(--text-primary)]">{stats.activeProjects}</h3>
                </Card>

                <Card className="p-6 bg-[var(--bg-card)] border-[var(--bg-input)] shadow-sm hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Pending Proposals</p>
                    <h3 className="text-3xl font-bold text-[var(--text-primary)]">{stats.pendingProposals}</h3>
                </Card>

                <Card className="p-6 bg-[var(--bg-card)] border-[var(--bg-input)] shadow-sm hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total Invested</p>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                        KES {stats.totalInvested.toLocaleString()}
                    </h3>
                </Card>

                <Card className="p-6 bg-[var(--bg-card)] border-[var(--bg-input)] shadow-sm hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Team Members</p>
                    <h3 className="text-3xl font-bold text-[var(--text-primary)]">{stats.teamMembers}</h3>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-8 bg-[var(--bg-card)] border-[var(--bg-input)]">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Quick Actions</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link
                        href="/dashboard/client/new-project"
                        className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white hover:shadow-xl transition-all group"
                    >
                        <Plus className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-lg mb-2">Start New Project</h3>
                        <p className="text-indigo-100 text-sm">Create a project and hire a commissioner</p>
                    </Link>

                    <Link
                        href="/dashboard/client/discovery"
                        className="p-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl text-white hover:shadow-xl transition-all group"
                    >
                        <Search className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-lg mb-2">Browse Commissioners</h3>
                        <p className="text-teal-100 text-sm">Find the perfect lead for your project</p>
                    </Link>

                    <Link
                        href="/dashboard/client/messages"
                        className="p-6 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl text-white hover:shadow-xl transition-all group"
                    >
                        <MessageSquare className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-lg mb-2">View Messages</h3>
                        <p className="text-orange-100 text-sm">Stay in touch with your team</p>
                    </Link>
                </div>
            </Card>

            {/* Recent Activity Feed */}
            <Card className="p-8 bg-[var(--bg-card)] border-[var(--bg-input)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Activity</h2>
                    <Link href="/dashboard/client/projects" className="text-sm text-[var(--primary)] font-bold hover:underline">
                        View All Projects →
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-[var(--bg-input)] animate-pulse rounded-lg"></div>
                        ))}
                    </div>
                ) : stats.activeProjects === 0 && stats.pendingProposals === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Active Projects</h3>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Start your first project to see activity here
                        </p>
                        <Link
                            href="/dashboard/client/new-project"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Project
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-[var(--bg-input)]/30 rounded-lg">
                            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-[var(--text-primary)]">Project milestone completed</p>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    "Frontend Development" was approved • 2 hours ago
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-[var(--bg-input)]/30 rounded-lg">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-[var(--text-primary)]">New message from commissioner</p>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    "The landing page designs are ready..." • 5 hours ago
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-[var(--bg-input)]/30 rounded-lg">
                            <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-[var(--text-primary)]">Pending approval required</p>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    "Database Schema" milestone needs review • 1 day ago
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Trust Footer */}
            <div className="flex justify-center gap-8 text-[var(--text-secondary)] text-xs font-medium uppercase tracking-widest pt-8 border-t border-[var(--bg-input)]">
                <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    110% Refund Guarantee
                </span>
                <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    Verified Talent Only
                </span>
                <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    24/7 Support Active
                </span>
            </div>
        </div>
    );
}
