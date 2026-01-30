'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Briefcase,
    Calendar,
    CheckCircle,
    DollarSign,
    User,
    Zap,
    ShieldCheck,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import ProjectFileManager from '@/components/projects/ProjectFileManager';

export default function AdminProjectDetailPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<any[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [assigning, setAssigning] = useState<string | null>(null);

    // Unwrap params 
    // Note: Next.js 15+ convention for async params, but using simpler prop access for now unless strict
    const { id } = params;

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${id}`); // We might need to ensure this route exists for singular fetching or use query param
                // Assuming we can fetch by ID or filter. If no specific ID route, we'll fetch all and find (less efficient).
                // Let's assume we need to update api/projects to handle /api/projects?id=X or create /api/projects/[id]
                // For now, let's try reading from the list endpoint if [id] is not separate

                // Correction: We have not created /api/projects/[id] yet? 
                // Let's assume we need to fetch all and filter for now as a fallback if specific route fails
                const resList = await fetch('/api/projects');
                const listData = await resList.json();
                const found = listData.data?.find((p: any) => p.id === id);

                if (found) {
                    setProject(found);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const runMatcher = async () => {
        setLoadingMatches(true);
        try {
            const res = await fetch(`/api/projects/${id}/match`);
            const json = await res.json();
            if (json.success) {
                setMatches(json.matches);
            } else {
                alert('Matcher failed: ' + json.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error running matcher');
        } finally {
            setLoadingMatches(false);
        }
    };

    const assignDeveloper = async (developerId: string) => {
        if (!confirm('Assign this developer to the project? This will notify them.')) return;

        setAssigning(developerId);
        try {
            const res = await fetch('/api/projects', {
                method: 'PATCH', // Assuming we update project via PATCH
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: project.id,
                    developer_id: developerId,
                    status: 'active' // Move to active once assigned?
                })
            });

            if (res.ok) {
                alert('Developer assigned successfully!');
                window.location.reload();
            } else {
                alert('Failed to assign');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setAssigning(null);
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!project) return <div className="p-12 text-center text-red-500">Project not found</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                    <div className="flex items-center gap-4 mt-2 text-gray-500">
                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> Client: {project.client?.name || 'Unknown'}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(project.created_at).toLocaleDateString()}</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase">{project.status}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="text-2xl font-bold text-gray-900">{project.budget_range || 'Not set'}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4">Project Description</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.required_skills?.map((skill: string) => (
                                <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                                    {skill}
                                </span>
                            )) || <span className="text-gray-400 italic">No specific skills listed</span>}
                        </div>
                    </Card>

                    <ProjectFileManager projectId={id} />
                </div>

                {/* Sidebar / Matcher */}
                <div className="space-y-6">
                    <Card className="p-6 border-indigo-100 bg-indigo-50/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-indigo-600" />
                                AI Team Matcher
                            </h3>
                        </div>

                        {project.developer_id ? (
                            <div className="bg-green-100 p-4 rounded-xl border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="font-bold text-green-800">Developer Assigned</span>
                                </div>
                                <p className="text-green-700 text-sm">
                                    Funds are in escrow. Milestones are active.
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-indigo-700 mb-4">
                                    Scan our developer pool to find the best match based on skills, reliability, and automated scoring.
                                </p>
                                <button
                                    onClick={runMatcher}
                                    disabled={loadingMatches}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2"
                                >
                                    {loadingMatches ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                    Find Perfect Match
                                </button>
                            </>
                        )}
                    </Card>

                    {matches.length > 0 && !project.developer_id && (
                        <div className="space-y-4 animate-fade-in-up">
                            <h4 className="font-bold text-gray-700">Top Recommendations</h4>
                            {matches.map(({ developer, score, matchReasons }) => (
                                <Card key={developer.id} className="p-4 hover:shadow-md transition border-l-4 border-indigo-500">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h5 className="font-bold text-gray-900">{developer.user?.name || 'Unknown Dev'}</h5>
                                            <p className="text-xs text-gray-500">{developer.experience_level} • {developer.active_jobs_count} Active Jobs</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-indigo-600">{score}%</span>
                                            <p className="text-[10px] uppercase text-gray-400 font-bold">Match Score</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-4">
                                        {matchReasons.map((reason: string, i: number) => (
                                            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                                {reason}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => assignDeveloper(developer.id)}
                                        disabled={assigning === developer.id}
                                        className="w-full py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-xs transition"
                                    >
                                        {assigning === developer.id ? 'Assigning...' : 'Assign to Project'}
                                    </button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
