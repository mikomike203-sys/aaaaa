'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Star,
    Clock,
    Briefcase,
    CheckCircle,
    ChevronRight,
    MapPin,
    ArrowUpRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { GoldBadge } from '@/components/ui/GoldBadge';
import Link from 'next/link';

export default function DiscoveryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [commissioners, setCommissioners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = ['All', 'Web App', 'Mobile App', 'E-commerce', 'CRM', 'SaaS'];

    useEffect(() => {
        const fetchCommissioners = async () => {
            setLoading(true);
            try {
                let url = '/api/commissioners?';
                if (searchTerm) url += `search=${searchTerm}&`;
                if (selectedCategory && selectedCategory !== 'All') url += `category=${selectedCategory}`;

                const response = await fetch(url);
                const result = await response.json();
                if (result.success) {
                    setCommissioners(result.data);
                }
            } catch (error) {
                console.error('Error fetching commissioners:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchCommissioners, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, selectedCategory]);

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Find a Commissioner</h1>
                <p className="text-gray-500 text-lg">Browse trusted partners to lead your next digital project.</p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 px-2 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat || (cat === 'All' && !selectedCategory)
                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <Card key={i} className="h-80 animate-pulse bg-gray-50 border-none" />
                    ))
                ) : commissioners.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No commissioners found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    commissioners.map((comm) => (
                        <Link href={`/dashboard/client/discovery/${comm.id}`} key={comm.id} className="group">
                            <Card className="h-full border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 overflow-hidden relative  hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                <div className="p-6">
                                    {/* Header Profile */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            {comm.avatar ? (
                                                <img src={comm.avatar} alt={comm.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                                                    {comm.name[0]}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                                    {comm.name}
                                                    <GoldBadge tier={comm.tier} size="sm" />
                                                </h3>
                                                <div className="flex items-center gap-1 text-xs font-semibold text-yellow-500 mt-1">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span>{comm.rating.toFixed(1)}</span>
                                                    <span className="text-gray-300 mx-1">•</span>
                                                    <span className="text-gray-400 font-medium">{comm.completed_projects} projects</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                                        {comm.bio || `Specialized digital lead with a focus on high-performance ${comm.specialties?.[0] || 'projects'}. Reliable delivery.`}
                                    </p>

                                    {/* Stats Chips */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                            {comm.price_range}
                                        </div>
                                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                            {comm.delivery_time}
                                        </div>
                                    </div>

                                    {/* Specialties */}
                                    <div className="flex flex-wrap gap-1.5 mb-8">
                                        {comm.specialties?.slice(0, 3).map((tag: string) => (
                                            <span key={tag} className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                        {comm.specialties?.length > 3 && (
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">+{comm.specialties.length - 3}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between group-hover:bg-indigo-50/30 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${comm.availability === 'available' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{comm.availability === 'available' ? 'Available' : 'Booked'}</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        View Profile <ArrowUpRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
