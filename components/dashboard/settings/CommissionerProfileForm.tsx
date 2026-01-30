'use client';

import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommissionerProfileForm({ initialData, userId }: { initialData: any, userId: string }) {
    const [formData, setFormData] = useState({
        bio: initialData?.bio || '',
        location: initialData?.location || '',
        niche_expertise: initialData?.niche_expertise || '',
        mpesa_number: initialData?.mpesa_number || '',
        linkedin_url: initialData?.social_links?.linkedin || ''
    });
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/commissioner/profile', {
                method: 'POST', // or PATCH
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    social_links: { linkedin: formData.linkedin_url }
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        placeholder="Tell clients why they should trust you..."
                    />
                    <p className="text-xs text-gray-500 mt-1">This will be visible to claimed leads.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Nairobi, Westlands"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Niche Expertise</label>
                    <input
                        type="text"
                        name="niche_expertise"
                        value={formData.niche_expertise}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Real Estate, Gov-Tech"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Number</label>
                    <input
                        type="text"
                        name="mpesa_number"
                        value={formData.mpesa_number}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+254..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                    <input
                        type="url"
                        name="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://linkedin.com/in/..."
                    />
                </div>

                {initialData?.referral_code && (
                    <div className="col-span-2 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Your Referral Code</label>
                        <div className="flex items-center gap-4">
                            <code className="text-lg font-mono font-bold text-blue-600">{initialData.referral_code}</code>
                            <span className="text-xs text-gray-400">(Auto-generated)</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-70"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Profile
                </button>
            </div>
        </form>
    );
}
