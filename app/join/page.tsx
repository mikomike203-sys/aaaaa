'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Users, DollarSign, Rocket, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';

function JoinPageContent() {
    const searchParams = useSearchParams();
    const referralCode = searchParams.get('ref');

    useEffect(() => {
        if (referralCode) {
            Cookies.set('referral_code', referralCode, { expires: 7 });
        }
    }, [referralCode]);

    return (
        <div className="min-h-screen bg-[var(--bg-card)]">
            {/* Navigation */}
            <nav className="border-b border-[var(--bg-input)] bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <Rocket className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Nexus</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="#benefits" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Benefits</Link>
                            <Link href="#commission" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Commission</Link>
                            <Link href="/login" className="px-6 py-3 bg-gray-50 text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all uppercase tracking-widest">Sign In</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden pt-20 pb-32">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-50/50 to-transparent -z-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
                    {referralCode && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full animate-bounce">
                            <Users className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Invited by a partner</span>
                        </div>
                    )}
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
                        Earn up to <span className="text-indigo-600">30% Commission</span><br />
                        by managing digital projects.
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-500 font-medium">
                        Join our exclusive network of Commissioners. Bridge the gap between clients and elite developers while building a scalable agency business.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            href={`/signup?role=commissioner${referralCode ? `&ref=${referralCode}` : ''}`}
                            className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-2 group"
                        >
                            Become a Commissioner
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/signup?role=developer"
                            className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-indigo-600 transition-all flex items-center justify-center gap-2"
                        >
                            Apply as Developer
                        </Link>
                    </div>
                </div>
            </div>

            {/* Benefits Grid */}
            <div id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-gray-100">
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <DollarSign className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">High Payouts</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Earn significant commissions on every project milestone. No caps on your earning potential.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Access Elite Talent</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Focus on sales and management while our pre-vetted engineers handle the technical delivery.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Full Support</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Get access to marketing materials, legal contracts, and project management tools out of the box.
                        </p>
                    </div>
                </div>
            </div>

            {/* Commission Table Section */}
            <div id="commission" className="bg-gray-900 py-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Transparent Commission Tiers</h2>
                        <p className="text-indigo-200/60 text-lg max-w-2xl mx-auto font-medium">As you close more projects, your commission percentage grows.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Bronze', rate: '25%', target: 'Starting level', color: 'from-orange-400 to-orange-700' },
                            { name: 'Silver', rate: '27%', target: 'KES 2M+ Volume', color: 'from-gray-300 to-gray-500' },
                            { name: 'Gold', rate: '30%', target: 'KES 5M+ Volume', color: 'from-yellow-400 to-yellow-600' }
                        ].map((tier) => (
                            <div key={tier.name} className="relative group">
                                <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                                <div className="relative bg-white/5 border border-white/10 p-10 rounded-[2rem] backdrop-blur-sm text-center space-y-6">
                                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center font-black text-white text-xl shadow-2xl`}>
                                        {tier.name[0]}
                                    </div>
                                    <h3 className="text-2xl font-black text-white">{tier.name}</h3>
                                    <div className="text-5xl font-black text-indigo-400">{tier.rate}</div>
                                    <p className="text-indigo-200/40 text-sm font-bold uppercase tracking-widest">{tier.target}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-20 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">Nexus</span>
                    </div>
                    <div className="flex gap-10">
                        <Link href="#" className="text-xs font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest">Privacy Policy</Link>
                        <Link href="#" className="text-xs font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest">Terms of Service</Link>
                        <Link href="#" className="text-xs font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest">Contact Us</Link>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">© 2026 Nexus Agency Network</p>
                </div>
            </footer>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <JoinPageContent />
        </Suspense>
    );
}
