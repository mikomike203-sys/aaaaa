'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { MoreHorizontal, Plus, ChevronLeft, Calendar, DollarSign, User, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Data Types
type ProjectStatus = 'pending' | 'active' | 'completed' | 'on_hold' | 'cancelled';

interface ProjectCard {
    id: string;
    client: { name: string } | string;
    title: string;
    budget: number | string;
    timeline: string;
    status: ProjectStatus;
}

const columns: { title: string; status: ProjectStatus; color: string }[] = [
    { title: 'New / Pending', status: 'pending', color: 'bg-gray-100 border-gray-200' },
    { title: 'In Progress', status: 'active', color: 'bg-indigo-50 border-indigo-100' },
    { title: 'On Hold', status: 'on_hold', color: 'bg-yellow-50 border-yellow-100' },
    { title: 'Completed', status: 'completed', color: 'bg-green-50 border-green-100' },
];

export default function PipelinePage() {
    const [projects, setProjects] = useState<ProjectCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects');
                const data = await res.json();
                if (data.success) {
                    setProjects(data.data);
                }
            } catch (error) {
                console.error('Error fetching pipeline projects:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <Link href="/dashboard/commissioner" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2">
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Project Pipeline</h2>
                </div>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-black flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Project
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-6 h-full min-w-[1200px]">
                    {columns.map((col) => {
                        const colProjects = projects.filter(p => p.status === col.status);

                        return (
                            <div key={col.status} className="flex-1 min-w-[280px] flex flex-col h-full">
                                <div className={`p-3 rounded-t-xl border-b-2 font-bold text-sm tracking-wide text-gray-700 flex justify-between items-center ${col.color.split(' ')[0]}`}>
                                    {col.title}
                                    <span className="bg-white/50 px-2 py-0.5 rounded-md text-xs">
                                        {colProjects.length}
                                    </span>
                                </div>

                                <div className={`flex-1 bg-gray-50/50 p-3 rounded-b-xl border border-t-0 space-y-3 overflow-y-auto ${col.color.split(' ')[2]}`}>
                                    {colProjects.map(project => (
                                        <Card key={project.id} className="p-4 cursor-grab hover:shadow-md transition-all border-gray-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-900 leading-tight">{project.title}</h4>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                                <User className="w-3 h-3" />
                                                {typeof project.client === 'object' ? project.client.name : 'Unknown Client'}
                                            </div>

                                            <div className="flex items-center justify-between text-xs font-semibold pt-3 border-t border-gray-50">
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <DollarSign className="w-3 h-3" />
                                                    KES {Number(project.budget).toLocaleString()}
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <Calendar className="w-3 h-3" />
                                                    {project.timeline}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}

                                    {colProjects.length === 0 && (
                                        <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400 font-medium">
                                            No projects
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
