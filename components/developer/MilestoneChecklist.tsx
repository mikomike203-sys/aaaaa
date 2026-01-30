'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
};

export default function MilestoneChecklist({
    milestone,
    onUpdate
}: {
    milestone: Milestone;
    onUpdate: (updatedMilestone: Milestone) => void;
}) {
    const [checklist, setChecklist] = useState<ChecklistItem[]>(milestone.checklist || []);
    const [newItemText, setNewItemText] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const addItem = () => {
        if (!newItemText.trim()) return;

        const newItem: ChecklistItem = {
            id: Date.now(),
            text: newItemText.trim(),
            completed: false
        };

        const updatedChecklist = [...checklist, newItem];
        setChecklist(updatedChecklist);
        setNewItemText('');
        saveChecklist(updatedChecklist);
    };

    const toggleItem = (itemId: number) => {
        const updatedChecklist = checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        setChecklist(updatedChecklist);
        saveChecklist(updatedChecklist);
    };

    const removeItem = (itemId: number) => {
        const updatedChecklist = checklist.filter(item => item.id !== itemId);
        setChecklist(updatedChecklist);
        saveChecklist(updatedChecklist);
    };

    const saveChecklist = async (updatedChecklist: ChecklistItem[]) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/milestones/${milestone.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checklist: updatedChecklist })
            });

            if (!res.ok) throw new Error('Failed to update checklist');

            const updatedMilestone = await res.json();
            onUpdate(updatedMilestone);
        } catch (err) {
            console.error('Error saving checklist:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const completedCount = checklist.filter(item => item.completed).length;
    const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">{milestone.title}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Milestone Progress
                        </span>
                        <div className="h-1 w-1 rounded-full bg-gray-300" />
                        <span className="text-sm font-bold text-indigo-600">
                            {completedCount}/{checklist.length} Tasks
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <motion.span
                        key={progress}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-black text-indigo-600"
                    >
                        {progress}%
                    </motion.span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 p-1">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                />
            </div>

            {/* Checklist Items */}
            <div className="grid gap-3">
                <AnimatePresence mode="popLayout">
                    {checklist.map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${item.completed
                                    ? 'bg-gray-50/50 border-gray-100'
                                    : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5'
                                }`}
                        >
                            <button
                                onClick={() => toggleItem(item.id)}
                                className="relative flex-shrink-0 focus:outline-none"
                                disabled={isUpdating}
                            >
                                <motion.div
                                    whileTap={{ scale: 0.8 }}
                                    className="relative"
                                >
                                    {item.completed ? (
                                        <CheckCircle2 className="w-7 h-7 text-green-500 fill-green-50" />
                                    ) : (
                                        <Circle className="w-7 h-7 text-gray-300 group-hover:text-indigo-400" />
                                    )}
                                </motion.div>
                            </button>

                            <div className="flex-1 min-w-0">
                                <p className={`text-base font-medium transition-all duration-300 truncate ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                                    }`}>
                                    {item.text}
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1, color: '#ef4444' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeItem(item.id)}
                                className="flex-shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-xl"
                                disabled={isUpdating}
                            >
                                <Trash2 className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add New Item */}
            <div className="relative group">
                <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                    placeholder="Describe a project milestone or task..."
                    className="w-full pl-5 pr-32 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    disabled={isUpdating}
                />
                <div className="absolute right-2 top-2 bottom-2">
                    <button
                        onClick={addItem}
                        disabled={!newItemText.trim() || isUpdating}
                        className="h-full px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add Task
                    </button>
                </div>
            </div>
        </div>
    );
}
