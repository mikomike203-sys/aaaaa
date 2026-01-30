'use client';

import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-white rounded-3xl shadow-2xl p-10 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-2 bg-red-500"></div>

                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-4 italic uppercase tracking-tighter">Payment Cancelled</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        No worries! Your transaction has been cancelled. No funds were dedcuted.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-black transition-all flex items-center justify-center gap-2 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Return to Project Page
                        </button>

                        <Link
                            href="/dashboard/client/support"
                            className="w-full py-4 text-[#1f7a5a] font-bold text-xs uppercase tracking-widest hover:text-[#176549] flex items-center justify-center gap-2 transition-colors border border-[#1f7a5a]/10 rounded-2xl"
                        >
                            <MessageCircle className="w-3 h-3" />
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
