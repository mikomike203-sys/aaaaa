'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, Users, DollarSign, Calendar, CheckCircle, Clock, MessageSquare, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import ProjectFileManager from '@/components/projects/ProjectFileManager';
import ProjectChat from '@/components/dashboard/ProjectChat';
import MilestoneProgress from '@/components/client/MilestoneProgress';

interface Project {
    id: string;
    title: string;
    description: string;
    status: string;
    budget: string;
    created_at: string;
    team_members?: Array<{
        user: {
            name: string;
            avatar_url?: string;
        };
    }>;
    milestones?: Array<{
        id: string;
        title: string;
        status: string;
        deliverable_link?: string;
    }>;
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [milestones, setMilestones] = useState<any[]>([]);

    useEffect(() => {
        fetchProject();
        fetchMilestones();
    }, [params.id]);

    const fetchProject = async () => {
        try {
            const response = await fetch(`/api/projects/${params.id}`);
            const result = await response.json();
            if (result.success) {
                setProject(result.data);
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMilestones = async () => {
        try {
            const response = await fetch(`/api/projects/${params.id}/milestones`);
            if (response.ok) {
                const data = await response.json();
                setMilestones(data);
            }
        } catch (error) {
            console.error('Error fetching milestones:', error);
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
                            Created {new Date(project.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm ${statusColors[project.status] || statusColors.pending}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Description */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Project Description</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {project.description}
                        </p>
                    </Card>

                    {/* Milestones */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            Project Milestones & Progress
                        </h2>
                        {milestones && milestones.length > 0 ? (
                            <div className="space-y-6">
                                {milestones.map((milestone) => (
                                    <MilestoneProgress
                                        key={milestone.id}
                                        milestone={milestone}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-[var(--text-secondary)] text-sm">No milestones yet</p>
                        )}
                    </Card>

                    <ProjectFileManager projectId={params.id as string} />

                    {/* Project Chat */}
                    <ProjectChat projectId={params.id as string} currentUserId={(session?.user as any)?.id} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Team */}
                    <Card className="p-6">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Team
                        </h3>
                        {project.team_members && project.team_members.length > 0 ? (
                            <div className="space-y-3">
                                {project.team_members.map((member, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                                            {member.user.avatar_url ? (
                                                <img
                                                    src={member.user.avatar_url}
                                                    alt={member.user.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-[var(--primary)]">
                                                    {member.user.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-medium text-[var(--text-primary)]">
                                            {member.user.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-[var(--text-secondary)]">No team members assigned</p>
                        )}
                    </Card>

                    {/* Budget */}
                    <Card className="p-6">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Budget
                        </h3>
                        <p className="text-2xl font-bold text-[var(--primary)]">{project.budget} KES</p>
                    </Card>

                    {/* Timeline */}
                    <Card className="p-6">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Timeline
                        </h3>
                        <div className="space-y-2 text-sm">
                            <p className="text-[var(--text-secondary)]">
                                <strong>Started:</strong> {new Date(project.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
