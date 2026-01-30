'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Shield, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
    const searchParams = useSearchParams();
    const leadId = searchParams.get('lead_id');

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-white rounded-3xl shadow-2xl p-10 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-4 italic uppercase tracking-tighter">Payment Received</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Your deposit has been securely processed via <span className="font-bold text-gray-900 italic">Paystack</span> and is now held in <span className="text-[#1f7a5a] font-bold">Secure Escrow</span>.
                    </p>

                    <div className="bg-[#1f7a5a]/5 border border-[#1f7a5a]/10 rounded-2xl p-6 mb-8 text-left">
                        <div className="flex items-start gap-4">
                            <Shield className="w-6 h-6 text-[#1f7a5a] shrink-0" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm italic uppercase">Escrow Protection Active</h4>
                                <p className="text-xs text-gray-500 mt-1 leading-normal">
                                    Funds will only be released to developers as they hit predefined milestones. You are 100% protected.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Link
                            href="/dashboard/client"
                            className="w-full py-4 bg-[#1f7a5a] text-white rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-[#176549] transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-900/10 group"
                        >
                            Open Client Dashboard
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/"
                            className="w-full py-4 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Home className="w-3 h-3" />
                            Return Home
                        </Link>
                    </div>
                </div>

                <p className="mt-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] italic">
                    Tech Developers Kenya • Secure Payouts • Guaranteed Results
                </p>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
