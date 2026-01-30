'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Users, DollarSign, Rocket, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function JoinPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [referralCode, setReferralCode] = useState<string | null>(null);

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            // Set cookie for 30 days
            Cookies.set('agency_referral_code', ref, { expires: 30 });
            setReferralCode(ref);
            console.log('Referral code captured:', ref);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 py-4 px-6 fixed w-full z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">TechDev Agency</span>
                    <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium">Log In</Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-grow pt-24 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    {referralCode && (
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium animate-fade-in-up">
                            <CheckCircle className="w-4 h-4" />
                            Invited by Team Member ({referralCode})
                        </div>
                    )}

                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        Turn Your Network Into <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Passive Income</span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Join Africa's fastest-growing tech agency as a Commissioner. Connect clients with top developers and earn 25-30% recurring commissions.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                        <Link
                            href={`/signup?role=commissioner${referralCode ? `&ref=${referralCode}` : ''}`}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                        >
                            Start Earning Now <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-lg font-bold px-8 py-4 rounded-xl border border-gray-200 shadow-sm transition"
                        >
                            How It Works
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-6xl mx-auto mt-20 grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">High Commission Logic</h3>
                        <p className="text-gray-600">
                            Earn 25% on every deal you close. Hit Silver status and bump that to 27%. Top performers join the Gold tier.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Build Your Team</h3>
                        <p className="text-gray-600">
                            Invite other commissioners and earn a 5% override on everything they sell. Forever.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                            <Rocket className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">We Handle The Tech</h3>
                        <p className="text-gray-600">
                            You focus on sales. Our vetted developers handle the code, delivery, and support.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
