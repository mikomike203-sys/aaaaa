'use client';

import { useState, useEffect } from 'react';
import {
    Bell,
    Moon,
    Sun,
    Globe,
    Lock,
    Shield,
    Smartphone,
    Save,
    Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/user/settings')
            .then(res => res.json())
            .then(data => {
                if (data.success) setSettings(data.data);
                setLoading(false);
            });
    }, []);

    const saveSettings = async (updated: any) => {
        setSaving(true);
        try {
            const res = await fetch('/api/user/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            if (res.ok) setSettings(updated);
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading your preferences...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-500 mt-2">Personalize your Nexus experience and communication preferences.</p>
            </div>

            <div className="grid gap-6">
                {/* Appearance */}
                <Card className="p-6 border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Sun className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">Appearance</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-800">Theme Preference</p>
                                <p className="text-sm text-gray-500">Choose how Nexus looks on your device.</p>
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                {['light', 'dark', 'system'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => saveSettings({ ...settings, theme: t })}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${settings.theme === t
                                                ? 'bg-white shadow-sm text-indigo-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <span className="capitalize">{t}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Notifications */}
                <Card className="p-6 border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Bell className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">Notifications</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-800">Email Alerts</p>
                                <p className="text-sm text-gray-500">Receive summaries of project activity and payments.</p>
                            </div>
                            <button
                                onClick={() => saveSettings({ ...settings, notifications_enabled: !settings.notifications_enabled })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifications_enabled ? 'bg-indigo-600' : 'bg-gray-200'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.notifications_enabled ? 'translate-x-6' : ''
                                    }`} />
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Regional */}
                <Card className="p-6 border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Globe className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">Region & Language</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Display Language</label>
                            <select
                                value={settings.language}
                                onChange={e => saveSettings({ ...settings, language: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="en">English (US)</option>
                                <option value="sw">Swahili</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Timezone</label>
                            <select
                                value={settings.timezone}
                                onChange={e => saveSettings({ ...settings, timezone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="Africa/Nairobi">EAT (Nairobi, Kenya)</option>
                                <option value="UTC">UTC (Universal)</option>
                            </select>
                        </div>
                    </div>
                </Card>
            </div>

            {saving && (
                <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-up">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Saving changes...</span>
                </div>
            )}
        </div>
    );
}
