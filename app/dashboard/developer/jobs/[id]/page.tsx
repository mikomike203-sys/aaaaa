'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, Code, DollarSign, Calendar, CheckCircle, Clock, MessageSquare, Loader2, Rocket, ExternalLink, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import ProjectFileManager from '@/components/projects/ProjectFileManager';
import ProjectChat from '@/components/dashboard/ProjectChat';
import MilestoneChecklist from '@/components/developer/MilestoneChecklist';

export default function DeveloperProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [milestones, setMilestones] = useState<any[]>([]);

    useEffect(() => {
        fetchProject();
        fetchMilestones();
    }, [params.id]);

    const fetchProject = async () => {
        try {
            const response = await fetch(`/api/projects`);
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

    const handleMilestoneUpdate = (updatedMilestone: any) => {
        setMilestones(prev => prev.map(m => m.id === updatedMilestone.id ? updatedMilestone : m));
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!project) return <div className="p-12 text-center text-red-500">Project not found</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{project.title}</h1>
                        <p className="text-gray-500 font-medium font-mono text-sm mt-1">ID: {project.id.slice(0, 8)}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100 flex items-center gap-2">
                        <Rocket className="w-4 h-4" />
                        Status: {project.status.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    <Card className="p-8 border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Code className="w-6 h-6 text-indigo-600" />
                            Work Scope
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                            {project.description}
                        </p>
                    </Card>


                    <ProjectFileManager projectId={params.id as string} />

                    {/* Milestones Section */}
                    {milestones.length > 0 && (
                        <Card className="p-8 border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                Project Milestones
                            </h2>
                            <div className="space-y-6">
                                {milestones.map((milestone) => (
                                    <MilestoneChecklist
                                        key={milestone.id}
                                        milestone={milestone}
                                        onUpdate={handleMilestoneUpdate}
                                    />
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <Card className="p-8 border-gray-100 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold">Project Financials</h3>
                            <DollarSign className="w-5 h-5 opacity-50" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Total Contract Value</p>
                            <p className="text-3xl font-black">KES {Number(project.total_value).toLocaleString()}</p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-indigo-200">Payment Status</span>
                                <span className="font-bold">Secured in Escrow</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            Key Dates
                        </h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-gray-500">Started on</span>
                                <span className="text-gray-900">{new Date(project.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-gray-500">Last Active</span>
                                <span className="text-gray-900">Today</span>
                            </div>
                        </div>
                    </Card>

                    <ProjectChat projectId={params.id as string} currentUserId={(session?.user as any)?.id} />
                </div>
            </div>
        </div>
    );
}
