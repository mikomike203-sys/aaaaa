'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

type ChecklistItem = {
    id: number;
    text: string;
    completed: boolean;
};

type Milestone = {
    id: string;
    title: string;
    description: string;
    checklist: ChecklistItem[];
    progress: number;
    status: string;
    due_date?: string;
};

export default function MilestoneProgress({ milestone }: { milestone: Milestone }) {
    const checklist = milestone.checklist || [];
    const completedCount = checklist.filter(item => item.completed).length;
    const progress = milestone.progress || 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500"
        >
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{milestone.title}</h3>
                    {milestone.description && (
                        <p className="text-sm font-medium text-gray-500 leading-relaxed">{milestone.description}</p>
                    )}
                </div>
                <div className="flex flex-col items-end">
                    <motion.div
                        key={progress}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-4xl font-black text-indigo-600"
                    >
                        {progress}%
                    </motion.div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Completion</div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Circular Progress Indicator */}
                <div className="flex items-center justify-center bg-gray-50/50 rounded-2xl py-8">
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke="#f1f5f9"
                                strokeWidth="12"
                            />
                            <motion.circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="12"
                                strokeDasharray={`${2 * Math.PI * 70}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - progress / 100) }}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-gray-900">{progress}%</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Done</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-gray-600">{completedCount} of {checklist.length} Tasks</span>
                            {milestone.due_date && (
                                <span className="text-xs font-medium text-gray-400">Target: {new Date(milestone.due_date).toLocaleDateString()}</span>
                            )}
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-4 p-1">
                            <motion.div
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full shadow-lg shadow-indigo-500/20"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                                milestone.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700' :
                                    'bg-gray-100 text-gray-600'
                            }`}>
                            {milestone.status.replace('_', ' ')}
                        </div>
                        {progress > 0 && progress < 100 && (
                            <span className="text-xs font-bold text-indigo-500 animate-pulse">In Active Development</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Checklist Items (Read-only for Client) */}
            {checklist.length > 0 && (
                <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Detailed Roadmap</h4>
                    <div className="grid gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {checklist.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${item.completed ? 'bg-green-50/50 border border-green-100/50' : 'bg-gray-50 border border-transparent'
                                    }`}
                            >
                                {item.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                ) : (
                                    <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                )}
                                <span className={`text-sm font-medium ${item.completed ? 'line-through text-green-700/60' : 'text-gray-700'}`}>
                                    {item.text}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
