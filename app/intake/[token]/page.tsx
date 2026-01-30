// Intake Page - Client Onboarding
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shield, CheckCircle, Phone, Mail, Calendar } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';

interface IntakeData {
    lead: {
        id: string;
        client_name: string;
        project_summary: string;
        budget: number;
    };
    commissioner: {
        name: string;
        photo?: string;
        rating: number;
        contact?: string;
    };
    projectSummary: string;
    estimatedTotal: number;
    milestones: Array<{
        title: string;
        description: string;
        percent: number;
    }>;
}

export default function IntakePage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [data, setData] = useState<IntakeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string>('card');

    useEffect(() => {
        fetch(`/api/intake/${token}`)
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setData(result.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handlePayDeposit = async () => {
        if (!data) return;
        if (!email || !phone) {
            alert('Please provide your email and phone number to proceed.');
            return;
        }

        setPaymentLoading(true);

        try {
            const response = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: data.lead.id,
                    method: selectedMethod,
                    client_email: email,
                    client_phone: phone
                })
            });

            const result = await response.json();
            if (result.success && result.data.payment_url) {
                window.location.href = result.data.payment_url;
            }
        } catch (error) {
            console.error('Payment error:', error);
            setPaymentLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-[#1f7a5a] border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your project...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Link not found</h1>
                    <p className="text-gray-600">This intake link may have expired or is invalid.</p>
                </div>
            </div>
        );
    }

    const depositAmount = (data.estimatedTotal * 43) / 100;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Commissioner Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-4">
                        {data.commissioner.photo ? (
                            <img
                                src={data.commissioner.photo}
                                alt={data.commissioner.name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-[#1f7a5a] flex items-center justify-center text-white text-2xl font-bold">
                                {data.commissioner.name[0]}
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-1">Your point of contact</p>
                            <h3 className="text-xl font-bold text-gray-900">{data.commissioner.name}</h3>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-yellow-500">★</span>
                                <span className="text-sm font-semibold">{data.commissioner.rating}</span>
                            </div>
                        </div>
                        {data.commissioner.contact && (
                            <a
                                href={`tel:${data.commissioner.contact}`}
                                className="px-4 py-2 border border-[#1f7a5a] text-[#1f7a5a] rounded-lg hover:bg-[#1f7a5a] hover:text-white"
                            >
                                <Phone className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#1f7a5a] to-[#176549] p-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">Start your project</h1>
                        <p className="text-lg opacity-90">Secure deposit held in escrow</p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Trust Strip */}
                        <div className="flex items-center gap-8 mb-8 pb-8 border-b">
                            <div className="flex items-center gap-2 text-sm">
                                <Shield className="w-5 h-5 text-[#1f7a5a]" />
                                <span className="font-semibold">Escrow protected</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-5 h-5 text-[#1f7a5a]" />
                                <span className="font-semibold">110% refund guarantee</span>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="space-y-4 mb-8">
                            <h2 className="text-xl font-bold mb-4">Choose how to proceed:</h2>

                            {/* Pay Deposit */}
                            <div className="border-2 border-[#1f7a5a] rounded-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Pay 43% deposit to start</h3>
                                <p className="text-3xl font-bold text-[#1f7a5a] mb-6">
                                    KES {depositAmount.toLocaleString()}
                                </p>

                                {/* Client Details Form */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Your Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="client@example.com"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#1f7a5a]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+254..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#1f7a5a]"
                                        />
                                    </div>
                                </div>

                                {/* Payment Method Selection */}
                                <div className="space-y-3 mb-4">
                                    <p className="text-sm font-semibold text-gray-700">Select payment method:</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setSelectedMethod('card')}
                                            className={`px-4 py-3 border-2 rounded-lg font-medium transition ${selectedMethod === 'card'
                                                ? 'border-[#1f7a5a] bg-[#1f7a5a] text-white'
                                                : 'border-gray-300 hover:border-[#1f7a5a]'
                                                }`}
                                        >
                                            Card
                                        </button>
                                        <button
                                            onClick={() => setSelectedMethod('mpesa')}
                                            className={`px-4 py-3 border-2 rounded-lg font-medium transition ${selectedMethod === 'mpesa'
                                                ? 'border-[#1f7a5a] bg-[#1f7a5a] text-white'
                                                : 'border-gray-300 hover:border-[#1f7a5a]'
                                                }`}
                                        >
                                            M-Pesa
                                        </button>
                                        <button
                                            onClick={() => setSelectedMethod('crypto')}
                                            className={`px-4 py-3 border-2 rounded-lg font-medium transition ${selectedMethod === 'crypto'
                                                ? 'border-[#1f7a5a] bg-[#1f7a5a] text-white'
                                                : 'border-gray-300 hover:border-[#1f7a5a]'
                                                }`}
                                        >
                                            Crypto
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayDeposit}
                                    disabled={paymentLoading}
                                    className="w-full py-4 bg-[#1f7a5a] text-white rounded-lg font-bold text-lg hover:bg-[#176549] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {paymentLoading ? 'Processing...' : 'Pay 43% to start (secure)'}
                                </button>
                            </div>

                            import {Dialog} from '@/components/ui/dialog';

                            // ... (existing imports)

                            export default function IntakePage() {
    // ... (existing state)
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
                            const [scheduleLoading, setScheduleLoading] = useState(false);

    const handleScheduleSubmit = async (e: React.FormEvent) => {
                                e.preventDefault();
                            setScheduleLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
                            setScheduleLoading(false);
                            setIsScheduleOpen(false);
                            alert('Meeting request sent! The commissioner will confirm via email.');
    };

                            // ... (existing render)

                            {/* Schedule Call */}
                            <button
                                onClick={() => setIsScheduleOpen(true)}
                                className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-[#1f7a5a] hover:text-[#1f7a5a] flex items-center justify-center gap-2"
                            >
                                <Calendar className="w-5 h-5" />
                                Schedule a free 15-minute call
                            </button>

                            <Dialog isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Schedule Consultation">
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Choose a time for a quick 15-minute intro call with {data.commissioner.name}.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Tomorrow 10:00 AM', 'Tomorrow 2:00 PM', 'Wed 11:00 AM', 'Thu 4:00 PM'].map((time) => (
                                            <button key={time} className="p-3 border rounded-lg hover:border-[#1f7a5a] hover:bg-[#1f7a5a]/5 text-sm font-medium transition-colors">
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleScheduleSubmit}
                                        disabled={scheduleLoading}
                                        className="w-full py-3 bg-[#1f7a5a] text-white rounded-xl font-bold hover:bg-[#176549] transition-all disabled:opacity-50"
                                    >
                                        {scheduleLoading ? 'Sending Request...' : 'Confirm Request'}
                                    </button>
                                </div>
                            </Dialog>
                        </div>

                        {/* Project Summary Accordion */}
                        <details className="group">
                            <summary className="cursor-pointer list-none font-semibold text-gray-900 py-3 border-t hover:text-[#1f7a5a]">
                                Project summary →
                            </summary>
                            <div className="pt-4 space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Description</h4>
                                    <p className="text-gray-600">{data.projectSummary}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Estimated Total</h4>
                                    <p className="text-gray-600">KES {data.estimatedTotal.toLocaleString()}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Proposed Milestones</h4>
                                    <ul className="space-y-2">
                                        {data.milestones.map((m, i) => (
                                            <li key={i} className="flex gap-3">
                                                <span className="font-semibold text-[#1f7a5a]">{m.percent}%</span>
                                                <div>
                                                    <p className="font-medium">{m.title}</p>
                                                    <p className="text-sm text-gray-600">{m.description}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </details>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-8 py-6 border-t text-sm text-gray-600">
                        <p className="mb-2">
                            <strong>Need help?</strong> Contact {data.commissioner.name} or call support at +254 700 000 000
                        </p>
                        <div className="flex gap-4">
                            <a href="/terms" className="text-[#1f7a5a] hover:underline">Terms</a>
                            <a href="/refunds" className="text-[#1f7a5a] hover:underline">110% Refund Policy</a>
                            <a href="/privacy" className="text-[#1f7a5a] hover:underline">Privacy</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
