import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { AlertCircle, Check, X, ExternalLink } from 'lucide-react';
import ApprovalActionButtons from '@/components/dashboard/admin/ApprovalActionButtons';

export default async function AdminApprovalsPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'admin') {
        redirect('/login');
    }

    // Fetch pending commissioners
    const { data: pendingCommissioners } = await db.supabaseAdmin
        .from('commissioners')
        .select('*, user:users(*)')
        .eq('kyc_status', 'pending');

    // Fetch pending developers
    const { data: pendingDevelopers } = await db.supabaseAdmin
        .from('developers')
        .select('*, user:users(*)')
        .eq('kyc_status', 'pending'); // Or 'submitted' depending on logic

    const hasPending = (pendingCommissioners?.length || 0) + (pendingDevelopers?.length || 0) > 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
                    <p className="text-gray-500 mt-1">Review and approve new member signups</p>
                </div>
            </div>

            {!hasPending ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">All Caught Up!</h3>
                    <p className="text-gray-500">No pending approvals at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {/* Commissioners Section */}
                    {pendingCommissioners && pendingCommissioners.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">Commissioners</span>
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingCommissioners.map((comm: any) => (
                                    <div key={comm.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                                    {comm.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{comm.user?.name}</h3>
                                                    <p className="text-sm text-gray-500">{comm.user?.email}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <p className="font-medium text-gray-700">Location</p>
                                                    <p className="text-gray-600">{comm.location || 'Not set'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700">Expertise</p>
                                                    <p className="text-gray-600">{comm.niche_expertise || 'Not set'}</p>
                                                </div>
                                                {comm.bio && (
                                                    <div className="bg-gray-50 p-3 rounded text-gray-600 italic">
                                                        "{comm.bio}"
                                                    </div>
                                                )}
                                                {comm.social_links?.linkedin && (
                                                    <a href={comm.social_links.linkedin} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-blue-600 hover:underline">
                                                        <ExternalLink className="w-3 h-3" /> LinkedIn Profile
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                            <ApprovalActionButtons
                                                id={comm.id}
                                                type="commissioner"
                                                name={comm.user?.name}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Developers Section */}
                    {pendingDevelopers && pendingDevelopers.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">Developers</span>
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingDevelopers.map((dev: any) => (
                                    <div key={dev.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                                    {dev.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{dev.user?.name}</h3>
                                                    <p className="text-sm text-gray-500">{dev.user?.email}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <p className="font-medium text-gray-700">Roles</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {dev.roles && Array.isArray(dev.roles) && dev.roles.map((r: string) => (
                                                            <span key={r} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">{r}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700">Tech Stack</p>
                                                    <p className="text-gray-600">{Array.isArray(dev.tech_stack) ? dev.tech_stack.join(', ') : dev.tech_stack || 'Not set'}</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    {dev.github_url && (
                                                        <a href={dev.github_url} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-blue-600 hover:underline">
                                                            <ExternalLink className="w-3 h-3" /> GitHub
                                                        </a>
                                                    )}
                                                    {dev.portfolio_url && (
                                                        <a href={dev.portfolio_url} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-blue-600 hover:underline">
                                                            <ExternalLink className="w-3 h-3" /> Portfolio
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                            <ApprovalActionButtons
                                                id={dev.id}
                                                type="developer"
                                                name={dev.user?.name}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
