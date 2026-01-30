import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import PayDepositButton from '@/components/PayDepositButton';
import { ShieldCheck, Clock, CheckCircle, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ClientProjectsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    const user = session.user as any;
    const projects = await db.getProjectsByClient(user.id);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header & Guarantee Badge */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
                    <p className="text-gray-500 mt-1">Track progress, payments, and milestones</p>
                </div>

                {/* 110% Guarantee Badge */}
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
                    <div className="bg-green-100 p-2 rounded-full">
                        <ShieldCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-green-800">110% Money-Back Guarantee</h3>
                        <p className="text-sm text-green-700">Active Protection. On time, or we pay you.</p>
                    </div>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">No projects yet</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        Ready to start your next big idea? Contact a commissioner to get scoped.
                    </p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {projects.map((project: any) => (
                        <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Project Header */}
                            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h2 className="text-xl font-bold text-gray-900">{project.title}</h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${project.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            project.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                                project.status === 'deposit_pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {project.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 line-clamp-2">{project.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total Value</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {project.currency} {Number(project.total_value).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="p-6 bg-gray-50">
                                {project.status === 'deposit_pending' && (
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                                            <div>
                                                <h4 className="font-semibold text-yellow-900">Deposit Required</h4>
                                                <p className="text-sm text-yellow-800">Pay the 43% kickoff deposit to start development.</p>
                                            </div>
                                        </div>
                                        <PayDepositButton
                                            projectId={project.id}
                                            amount={project.total_value * 0.43}
                                            email={user.email}
                                        />
                                    </div>
                                )}

                                {project.status === 'active' && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Development In Progress</span>
                                    </div>
                                )}
                            </div>

                            {/* Milestones & Feed */}
                            <div className="p-6 grid md:grid-cols-2 gap-8">
                                {/* Timeline */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-500" />
                                        Project Timeline
                                    </h3>
                                    <div className="space-y-6 border-l-2 border-gray-100 ml-3 pl-6 relative">
                                        {project.milestones && project.milestones.length > 0 ? (
                                            project.milestones.map((milestone: any, index: number) => (
                                                <div key={milestone.id} className="relative">
                                                    <div className={`absolute -left-[29px] w-4 h-4 rounded-full border-2 ${milestone.status === 'approved' ? 'bg-green-500 border-green-500' :
                                                        milestone.status === 'in_progress' ? 'bg-blue-500 border-white ring-2 ring-blue-100' :
                                                            'bg-gray-200 border-white'
                                                        }`}></div>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className={`font-medium ${milestone.status === 'approved' ? 'text-gray-900' : 'text-gray-600'}`}>
                                                                {milestone.title}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">{milestone.description}</p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded ${milestone.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {milestone.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No milestones defined yet.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Updates / Feed */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-gray-500" />
                                        Recent Updates
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-4 h-64 overflow-y-auto">
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            No recent updates from the developer.
                                        </p>
                                        {/* TODO: Connect to developer update feed */}
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Link
                                            href={`/dashboard/client/projects/${project.id}`}
                                            className="text-sm text-[#1f7a5a] font-black hover:underline flex items-center gap-1 bg-green-50 px-4 py-2 rounded-lg"
                                        >
                                            Project Portal & Files <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
