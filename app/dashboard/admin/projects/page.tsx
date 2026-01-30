'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Briefcase,
    CheckCircle,
    Clock,
    AlertCircle,
    Search,
    ExternalLink,
    Filter,
    Layers,
    User
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function AdminProjectsPage() {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/projects');
                const result = await response.json();
                if (result.success) {
                    setProjects(result.data);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchProjects();
        }
    }, [session]);

    const filteredProjects = projects.filter(project => {
        const matchesSearch =
            project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'review': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Project Portfolio</h1>
                    <p className="text-gray-500 mt-2">Oversee all active, pending, and completed developmental work.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5347CE] outline-none w-full md:w-64"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5347CE] outline-none bg-white font-medium text-gray-700"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <Card key={i} className="p-6 space-y-4 animate-pulse">
                            <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-100 rounded"></div>
                                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                <div className="h-8 bg-gray-100 rounded w-24"></div>
                            </div>
                        </Card>
                    ))
                ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                        No projects found matching your filters.
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <Link href={`/dashboard/admin/projects/${project.id}`} key={project.id}>
                            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-gray-100 group cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusStyle(project.status)}`}>
                                        {project.status}
                                    </span>
                                    <button className="p-2 text-gray-400 hover:text-[#5347CE] hover:bg-indigo-50 rounded-lg transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#5347CE] transition-colors mb-2">
                                    {project.title}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                                    {project.description}
                                </p>

                                <div className="space-y-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Layers className="w-4 h-4" />
                                            <span>Progress</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{project.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${project.progress || 0}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className="text-xs">
                                                <p className="text-gray-400">Assigned Dev</p>
                                                <p className="font-medium text-gray-700 truncate w-24">
                                                    {project.developer_id ? 'Dev Assigned' : 'Unassigned'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Value</p>
                                            <p className="text-sm font-bold text-gray-900">KES {Number(project.total_value).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {project.status === 'active' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Are you sure you want to mark this project as COMPLETED? This will release funds to the Developer and Commissions.')) {
                                                    fetch(`/api/projects/${project.id}/ship`, { method: 'POST' })
                                                        .then(res => res.json())
                                                        .then(data => {
                                                            if (data.success) {
                                                                alert('Funds Released!');
                                                                window.location.reload();
                                                            } else {
                                                                alert(data.error);
                                                            }
                                                        });
                                                }
                                            }}
                                            className="w-full mt-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
                                        >
                                            Ship & Release Funds
                                        </button>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
