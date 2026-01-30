'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, Users, DollarSign, Calendar, CheckCircle, Clock, MessageSquare, Loader2, Link as LinkIcon, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import ProjectFileManager from '@/components/projects/ProjectFileManager';
import ProjectChat from '@/components/dashboard/ProjectChat';

interface Project {
    id: string;
    title: string;
    description: string;
    status: string;
    budget: string;
    created_at: string;
    client?: {
        company_name: string;
        contact_person: string;
    };
    developer?: {
        user: {
            name: string;
        }
    };
    milestones?: Array<{
        id: string;
        title: string;
        status: string;
        deliverable_link?: string;
    }>;
}

export default function CommissionerProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProject();
    }, [params.id]);

    const fetchProject = async () => {
        try {
            const response = await fetch(`/api/projects`); // Assume this returns all accessible projects
            const result = await response.json();
            if (result.success) {
                const found = result.data.find((p: any) => p.id === params.id);
                setProject(found);
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-[var(--text-secondary)]">Project not found</p>
                <button onClick={() => router.back()} className="mt-4 text-[var(--primary)] hover:underline">Go Back</button>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        active: 'bg-green-500/10 text-green-600 border-green-500/20',
        completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-[var(--bg-input)] rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">{project.title}</h1>
                        <p className="text-[var(--text-secondary)] mt-1">
                            Managed by {session?.user?.name}
                        </p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm ${statusColors[project.status] || statusColors.pending}`}>
                    {project.status.toUpperCase()}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Description */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            Project Overview
                        </h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {project.description}
                        </p>
                    </Card>

                    {/* Project Chat */}
                    <ProjectChat projectId={params.id as string} currentUserId={(session?.user as any)?.id} />

                    {/* Milestones */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            Milestones
                        </h2>
                        {project.milestones && project.milestones.length > 0 ? (
                            <div className="space-y-4">
                                {project.milestones.map((milestone, index) => (
                                    <div
                                        key={milestone.id}
                                        className="p-4 bg-[var(--bg-input)] rounded-xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${milestone.status === 'completed' ? 'bg-green-500 text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'}`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[var(--text-primary)]">
                                                    {milestone.title}
                                                </p>
                                                <p className="text-xs text-[var(--text-secondary)]">
                                                    Status: {milestone.status}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[var(--text-secondary)] text-sm">No milestones yet</p>
                        )}
                    </Card>

                    <ProjectFileManager projectId={params.id as string} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stakeholders */}
                    <Card className="p-6">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Stakeholders
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-secondary)]">Client</span>
                                <span className="font-bold">{project.client?.company_name || project.client?.contact_person || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-secondary)]">Developer</span>
                                <span className="font-bold">{project.developer?.user?.name || 'Unassigned'}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Budget */}
                    <Card className="p-6">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Financials
                        </h3>
                        <p className="text-2xl font-bold text-[var(--primary)]">{project.budget} KES</p>
                        <div className="mt-4 pt-4 border-t border-[var(--bg-input)]">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">Commission (25%)</span>
                                <span className="font-bold text-green-600">KES {(Number(project.budget) * 0.25).toLocaleString()}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Timeline */}
                    <Card className="p-6">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Timeline
                        </h3>
                        <div className="space-y-2 text-sm">
                            <p className="text-[var(--text-secondary)]">
                                <strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <Link
                            href={`/dashboard/commissioner/projects/${params.id}/timeline`}
                            className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/80 text-[var(--text-primary)] rounded-lg text-sm font-medium transition-colors"
                        >
                            View Gantt Chart <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Link>
                    </Card>
                </div>
            </div>
        </div>
    );
}
