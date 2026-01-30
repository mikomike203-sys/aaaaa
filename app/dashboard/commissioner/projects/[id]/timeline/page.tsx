'use client';

import { Card } from '@/components/ui/card';
import { ChevronLeft, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Mock Data for a single project
const projectData = {
    id: '123',
    title: 'E-commerce Redesign',
    client: 'Sarah K.',
    startDate: 'Oct 1, 2023',
    endDate: 'Nov 15, 2023',
    milestones: [
        { id: 1, title: 'Discovery & Strategy', startDay: 1, duration: 5, status: 'completed' },
        { id: 2, title: 'Wireframing & UX', startDay: 6, duration: 7, status: 'completed' },
        { id: 3, title: 'UI Design Phase 1', startDay: 13, duration: 5, status: 'active' },
        { id: 4, title: 'Development Sprint 1', startDay: 18, duration: 10, status: 'pending' },
        { id: 5, title: 'Testing & QA', startDay: 30, duration: 5, status: 'pending' },
    ]
};

const totalDays = 40; // Total timeline view

export default function TimelinePage({ params }: { params: { id: string } }) {
    // In real app, fetch project by params.id

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Link href="/dashboard/commissioner" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2">
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Project Timeline</h2>
                    <p className="text-gray-500">{projectData.title} • {projectData.client}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div> Completed
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div> Active
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div> Pending
                    </div>
                </div>
            </div>

            <Card className="p-8 border-gray-100 shadow-lg overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Timeline Headers */}
                    <div className="flex border-b border-gray-100 pb-4 mb-4">
                        <div className="w-1/4 font-bold text-gray-400 text-xs uppercase tracking-widest pl-4">Milestone Phase</div>
                        <div className="w-3/4 flex relative">
                            {/* Simple Month Markers (Mock) */}
                            <div className="absolute left-0 text-xs font-bold text-gray-400">Week 1</div>
                            <div className="absolute left-1/4 text-xs font-bold text-gray-400">Week 3</div>
                            <div className="absolute left-2/4 text-xs font-bold text-gray-400">Week 5</div>
                            <div className="absolute left-3/4 text-xs font-bold text-gray-400">Week 7</div>
                        </div>
                    </div>

                    {/* Gantt Rows */}
                    <div className="space-y-6">
                        {projectData.milestones.map((milestone) => {
                            const startPercent = (milestone.startDay / totalDays) * 100;
                            const widthPercent = (milestone.duration / totalDays) * 100;

                            let colorClass = 'bg-gray-200 text-gray-500';
                            if (milestone.status === 'completed') colorClass = 'bg-green-100 text-green-700 border-green-200';
                            if (milestone.status === 'active') colorClass = 'bg-indigo-600 text-white shadow-lg shadow-indigo-300';

                            return (
                                <div key={milestone.id} className="flex group">
                                    <div className="w-1/4 pr-4 py-2">
                                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">{milestone.title}</h4>
                                        <p className="text-xs text-gray-400">{milestone.duration} days</p>
                                    </div>
                                    <div className="w-3/4 relative h-12 flex items-center bg-gray-50/50 rounded-lg">
                                        {/* The Bar */}
                                        <div
                                            className={`absolute h-8 rounded-md flex items-center px-3 text-xs font-bold transition-all hover:scale-105 cursor-pointer ${colorClass}`}
                                            style={{
                                                left: `${startPercent}%`,
                                                width: `${widthPercent}%`
                                            }}
                                        >
                                            {milestone.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                            {milestone.status === 'active' && <Clock className="w-3 h-3 mr-1 animate-pulse" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>
        </div>
    );
}
