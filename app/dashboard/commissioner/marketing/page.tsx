'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Download, ExternalLink, Image as ImageIcon, Video, FileText, Mail, Share2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Asset {
    id: string;
    title: string;
    description: string;
    asset_type: 'banner' | 'email_swipe' | 'social_post' | 'video';
    url: string;
    thumbnail_url?: string;
    tier_required: string;
}

export default function MarketingAssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await fetch('/api/assets');
            const data = await res.json();
            if (data.success) {
                setAssets(data.data);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'banner': return <ImageIcon className="w-5 h-5 text-purple-500" />;
            case 'video': return <Video className="w-5 h-5 text-red-500" />;
            case 'email_swipe': return <Mail className="w-5 h-5 text-blue-500" />;
            default: return <Share2 className="w-5 h-5 text-indigo-500" />;
        }
    };

    const filteredAssets = filter === 'all'
        ? assets
        : assets.filter(a => a.asset_type === filter);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] tracking-tight">Marketing Portal</h1>
                    <p className="text-[var(--text-secondary)] mt-2">Professional assets to help you close more deals.</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'banner', 'social_post', 'email_swipe', 'video'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-[var(--primary)] text-white shadow-lg'
                                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-input)]'
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {filteredAssets.length === 0 ? (
                    <div className="col-span-3 py-20 text-center bg-[var(--bg-card)] rounded-3xl border-2 border-dashed border-[var(--bg-input)]">
                        <Megaphone className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-20" />
                        <p className="text-[var(--text-secondary)] font-medium">No assets found for this category.</p>
                    </div>
                ) : (
                    filteredAssets.map((asset) => (
                        <Card key={asset.id} className="overflow-hidden group border-none shadow-xl bg-[var(--bg-card)] hover:translate-y-[-4px] transition-all duration-300">
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                {asset.thumbnail_url ? (
                                    <img src={asset.thumbnail_url} alt={asset.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        {getIcon(asset.asset_type)}
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase text-indigo-600 shadow-sm">
                                    {asset.tier_required}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    {getIcon(asset.asset_type)}
                                    <h3 className="font-bold text-[var(--text-primary)] truncate">{asset.title}</h3>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 h-10 mb-6">
                                    {asset.description}
                                </p>
                                <div className="flex gap-2">
                                    <a
                                        href={asset.url}
                                        target="_blank"
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold text-center hover:bg-indigo-700 transition"
                                    >
                                        Download
                                    </a>
                                    <button className="p-3 bg-[var(--bg-input)] text-[var(--text-primary)] rounded-xl hover:bg-gray-200 transition">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Featured Section */}
            <Card className="p-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                        <span className="px-3 py-1 bg-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-full">New Release</span>
                        <h2 className="text-3xl font-black mt-4 mb-2">Q1 Agency Brand Pack</h2>
                        <p className="text-indigo-200 text-lg leading-relaxed">
                            Everything you need to pitch professional tech solutions. Includes updated proposal templates, 2026 service pricing, and verified client testimonials.
                        </p>
                        <button className="mt-8 px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition shadow-xl">
                            Unlock Full Pack
                        </button>
                    </div>
                    <div className="w-full md:w-64 aspect-square bg-indigo-800/50 rounded-3xl border border-indigo-400/20 flex items-center justify-center backdrop-blur-sm">
                        <ImageIcon className="w-16 h-16 text-indigo-300 opacity-50" />
                    </div>
                </div>
            </Card>
        </div>
    );
}
