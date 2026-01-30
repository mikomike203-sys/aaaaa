'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Award, DollarSign, MapPin, Save, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AvatarUpload } from '@/components/ui/AvatarUpload';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mpesaError, setMpesaError] = useState('');
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        avatar_url: '',
        // Role-specific fields
        company: '', // Client
        industry: '', // Client
        skills: '', // Developer
        hourly_rate: '', // Developer
        portfolio_url: '', // Developer
        mpesa_number: '', // Commissioner
        referral_code: '', // Commissioner
    });

    useEffect(() => {
        if (session?.user) {
            // Fetch user profile
            fetchProfile();
        }
    }, [session]);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile');
            const result = await response.json();
            if (result.success) {
                setProfile({
                    name: result.data.name || '',
                    email: result.data.email || '',
                    phone: result.data.phone || '',
                    bio: result.data.bio || '',
                    avatar_url: result.data.avatar_url || '',
                    company: result.data.company || '',
                    industry: result.data.industry || '',
                    skills: result.data.skills || '',
                    hourly_rate: result.data.hourly_rate || '',
                    portfolio_url: result.data.portfolio_url || '',
                    mpesa_number: result.data.mpesa_number || '',
                    referral_code: result.data.referral_code || '',
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateMpesa = (number: string): boolean => {
        if (!number) return true; // Allow empty
        const cleaned = number.replace(/\s/g, '');
        // Must be exactly 10 digits and start with 07 or 01
        return /^(07|01)\d{8}$/.test(cleaned);
    };

    const handleMpesaChange = (value: string) => {
        setProfile({ ...profile, mpesa_number: value });
        if (value && !validateMpesa(value)) {
            setMpesaError('M-Pesa number must be 10 digits starting with 07 or 01');
        } else {
            setMpesaError('');
        }
    };

    const handleSave = async () => {
        // Validate M-Pesa if commissioner
        if (userRole === 'commissioner' && profile.mpesa_number && !validateMpesa(profile.mpesa_number)) {
            alert('Please enter a valid M-Pesa number (10 digits starting with 07 or 01)');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });

            if (response.ok) {
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = (url: string) => {
        setProfile({ ...profile, avatar_url: url });
    };

    const userRole = (session?.user as any)?.role;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Profile Settings</h1>
                    <p className="text-[var(--text-secondary)] mt-2">Manage your personal information and preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Avatar Section */}
            <Card className="p-8">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Profile Picture</h2>
                <AvatarUpload
                    currentAvatar={profile.avatar_url}
                    onUpload={handleAvatarUpload}
                    userId={(session?.user as any)?.id}
                />
            </Card>

            {/* Basic Information */}
            <Card className="p-8">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Basic Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl bg-[var(--bg-input)] text-[var(--text-secondary)] cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            <Phone className="w-4 h-4 inline mr-2" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Bio
                        </label>
                        <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                </div>
            </Card>

            {/* Role-Specific Sections */}
            {userRole === 'client' && (
                <Card className="p-8">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Company Information</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                <Briefcase className="w-4 h-4 inline mr-2" />
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={profile.company}
                                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                <MapPin className="w-4 h-4 inline mr-2" />
                                Industry
                            </label>
                            <input
                                type="text"
                                value={profile.industry}
                                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                                className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                placeholder="e.g., Technology, Finance, Healthcare"
                            />
                        </div>
                    </div>
                </Card>
            )}

            {userRole === 'developer' && (
                <Card className="p-8">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Professional Details</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                <Award className="w-4 h-4 inline mr-2" />
                                Skills
                            </label>
                            <input
                                type="text"
                                value={profile.skills}
                                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                                className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                placeholder="e.g., React, Node.js, Python, AWS"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                <DollarSign className="w-4 h-4 inline mr-2" />
                                Hourly Rate (KES)
                            </label>
                            <input
                                type="number"
                                value={profile.hourly_rate}
                                onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })}
                                className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Portfolio URL
                            </label>
                            <input
                                type="url"
                                value={profile.portfolio_url}
                                onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                                className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                placeholder="https://your-portfolio.com"
                            />
                        </div>
                    </div>
                </Card>
            )}

            {userRole === 'commissioner' && (
                <Card className="p-8">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Commission Settings</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                <Phone className="w-4 h-4 inline mr-2" />
                                M-Pesa Number
                            </label>
                            <input
                                type="tel"
                                value={profile.mpesa_number}
                                onChange={(e) => handleMpesaChange(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none bg-[var(--bg-card)] text-[var(--text-primary)] ${mpesaError ? 'border-red-500 focus:ring-red-500' : 'border-[var(--bg-input)] focus:ring-[var(--primary)]'
                                    }`}
                                placeholder="07XXXXXXXX or 01XXXXXXXX"
                                maxLength={10}
                            />
                            {mpesaError && (
                                <p className="text-red-500 text-xs mt-1">{mpesaError}</p>
                            )}
                            <p className="text-[var(--text-secondary)] text-xs mt-1">
                                Required for receiving commission payouts
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Referral Code
                            </label>
                            <input
                                type="text"
                                value={profile.referral_code}
                                disabled
                                className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl bg-[var(--bg-input)] text-[var(--text-secondary)] cursor-not-allowed"
                            />
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
