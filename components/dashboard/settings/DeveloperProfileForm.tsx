'use client';

import { useState } from 'react';
import { Save, Loader2, Code, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeveloperProfileForm({ initialData, userId }: { initialData: any, userId: string }) {
    const [formData, setFormData] = useState({
        bio: initialData?.bio || '',
        tech_stack: initialData?.tech_stack?.join(', ') || '',
        experience_level: initialData?.experience_level || 'mid',
        portfolio_url: initialData?.portfolio_url || '',
        github_url: initialData?.github_url || '',
        roles: initialData?.roles || []
    });
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const availableRoles = [
        "Frontend", "Backend", "Fullstack", "Mobile", "UI/UX", "DevOps",
        "Data Science", "QA/Testing", "Blockchain", "Security", "Game Dev",
        "Embedded", "CRM Specialist"
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleToggle = (role: string) => {
        const currentRoles: string[] = Array.isArray(formData.roles) ? formData.roles : []; // Force array
        if (currentRoles.includes(role)) {
            setFormData({ ...formData, roles: currentRoles.filter(r => r !== role) });
        } else {
            setFormData({ ...formData, roles: [...currentRoles, role] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Convert tech_stack string to array
            const techStackArray = formData.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean);

            const res = await fetch('/api/developer/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tech_stack: techStackArray
                })
            });

            if (res.ok) {
                alert('Profile updated successfully!');
                router.refresh();
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        placeholder="Describe your technical background..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                    <select
                        name="experience_level"
                        value={formData.experience_level}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="junior">Junior (1-3 years)</option>
                        <option value="mid">Mid-Level (3-5 years)</option>
                        <option value="senior">Senior (5+ years)</option>
                        <option value="lead">Lead/Architect</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack (comma separated)</label>
                    <input
                        type="text"
                        name="tech_stack"
                        value={formData.tech_stack}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="React, Node.js, Python, AWS..."
                    />
                </div>
            </div>

            {/* Roles Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 block">Specialized Roles</label>
                <div className="flex flex-wrap gap-2">
                    {availableRoles.map(role => (
                        <button
                            key={role}
                            type="button"
                            onClick={() => handleRoleToggle(role)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${(Array.isArray(formData.roles) && formData.roles.includes(role))
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Links */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile</label>
                    <div className="relative">
                        <Code className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="url"
                            name="github_url"
                            value={formData.github_url}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://github.com/..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / Personal Site</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="url"
                            name="portfolio_url"
                            value={formData.portfolio_url}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://myportfolio.com"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-70"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Developer Profile
                </button>
            </div>
        </form>
    );
}
