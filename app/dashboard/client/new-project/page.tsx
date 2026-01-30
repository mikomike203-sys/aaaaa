'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';

const BUDGET_RANGES = [
    { label: 'Under 50,000 KES', value: '0-50000' },
    { label: '50,000 - 150,000 KES', value: '50000-150000' },
    { label: '150,000 - 300,000 KES', value: '150000-300000' },
    { label: '300,000 - 500,000 KES', value: '300000-500000' },
    { label: 'Above 500,000 KES', value: '500000+' },
];

const SKILLS_OPTIONS = [
    'React', 'Next.js', 'Node.js', 'Python', 'Django', 'Flutter',
    'React Native', 'UI/UX Design', 'AWS', 'PostgreSQL', 'MongoDB'
];

export default function NewProjectPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        projectType: '', // 'direct' or 'open'
        title: '',
        description: '',
        budget: '',
        timeline: '',
        skills: [] as string[],
        commissionerId: '',
    });

    const handleNext = () => {
        if (step === 1 && !formData.projectType) {
            alert('Please select a project type');
            return;
        }
        if (step === 2 && (!formData.title || !formData.description)) {
            alert('Please fill in all required fields');
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const toggleSkill = (skill: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.includes(skill)
                ? formData.skills.filter((s) => s !== skill)
                : [...formData.skills, skill],
        });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    client_id: (session?.user as any)?.id,
                }),
            });

            if (response.ok) {
                alert('Project created successfully!');
                router.push('/dashboard/client/projects');
            } else {
                alert('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-8">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--bg-input)] text-[var(--text-secondary)]'
                                }`}
                        >
                            {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                        </div>
                        {s < 4 && (
                            <div
                                className={`flex-1 h-1 mx-2 ${step > s ? 'bg-[var(--primary)]' : 'bg-[var(--bg-input)]'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            <Card className="p-8">
                {/* Step 1: Project Type */}
                {step === 1 && (
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Choose Project Type</h2>
                        <p className="text-[var(--text-secondary)] mb-8">
                            How would you like to start your project?
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <button
                                onClick={() => setFormData({ ...formData, projectType: 'direct' })}
                                className={`p-8 rounded-2xl border-2 transition-all text-left ${formData.projectType === 'direct'
                                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                                        : 'border-[var(--bg-input)] hover:border-[var(--primary)]/30'
                                    }`}
                            >
                                <Briefcase className="w-12 h-12 text-[var(--primary)] mb-4" />
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Direct Booking</h3>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Browse and hire a specific commissioner who matches your needs
                                </p>
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, projectType: 'open' })}
                                className={`p-8 rounded-2xl border-2 transition-all text-left ${formData.projectType === 'open'
                                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                                        : 'border-[var(--bg-input)] hover:border-[var(--primary)]/30'
                                    }`}
                            >
                                <Briefcase className="w-12 h-12 text-[var(--accent)] mb-4" />
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Post Requirement</h3>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Post your project and let commissioners come to you with proposals
                                </p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Project Details */}
                {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Project Details</h2>
                        <p className="text-[var(--text-secondary)] mb-8">Tell us about your project</p>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Project Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                    placeholder="e.g., E-commerce Mobile App"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                    placeholder="Describe your project requirements, goals, and any specific features..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Budget & Timeline */}
                {step === 3 && (
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Budget & Timeline</h2>
                        <p className="text-[var(--text-secondary)] mb-8">Set your project expectations</p>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Budget Range
                                </label>
                                <div className="grid gap-3">
                                    {BUDGET_RANGES.map((range) => (
                                        <button
                                            key={range.value}
                                            onClick={() => setFormData({ ...formData, budget: range.value })}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.budget === range.value
                                                    ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                                                    : 'border-[var(--bg-input)] hover:border-[var(--primary)]/30'
                                                }`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Expected Timeline
                                </label>
                                <input
                                    type="text"
                                    value={formData.timeline}
                                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                    className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                    placeholder="e.g., 2 months, 8 weeks, ASAP"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Skills Required */}
                {step === 4 && (
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Skills Required</h2>
                        <p className="text-[var(--text-secondary)] mb-8">Select the technologies needed</p>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {SKILLS_OPTIONS.map((skill) => (
                                <button
                                    key={skill}
                                    onClick={() => toggleSkill(skill)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${formData.skills.includes(skill)
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-input)]/70'
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                        <div className="bg-[var(--bg-input)] p-6 rounded-xl">
                            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Review Your Project</h3>
                            <div className="space-y-2 text-sm">
                                <p><strong>Type:</strong> {formData.projectType === 'direct' ? 'Direct Booking' : 'Post Requirement'}</p>
                                <p><strong>Title:</strong> {formData.title}</p>
                                <p><strong>Budget:</strong> {BUDGET_RANGES.find(r => r.value === formData.budget)?.label || 'Not set'}</p>
                                <p><strong>Skills:</strong> {formData.skills.join(', ') || 'None selected'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className="px-6 py-3 border border-[var(--bg-input)] rounded-xl hover:bg-[var(--bg-input)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2"
                        >
                            Next
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Project'
                            )}
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
}
