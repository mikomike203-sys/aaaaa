// Signup Page with Role Selection
'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'client', // Default to client
        phone: '',
        referralCode: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Check for referral cookie (set by /join page)
        const refCookie = document.cookie.split('; ').find(row => row.startsWith('agency_referral_code='));
        if (refCookie) {
            const code = refCookie.split('=')[1];
            setFormData(prev => ({ ...prev, referralCode: code }));
        }
    }, []);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                if (formData.role === 'client') {
                    // Auto-login clients
                    await signIn('credentials', {
                        email: formData.email,
                        password: formData.password,
                        callbackUrl: '/dashboard/client'
                    });
                } else {
                    // Show pending message for commissioners/developers
                    setMessage('Registration submitted! Your account is pending admin approval. You will receive an email once approved.');
                    setTimeout(() => router.push('/login'), 3000);
                }
            } else {
                setMessage(result.message || 'Signup failed. Please try again.');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        signIn('google', { callbackUrl: '/dashboard' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1f7a5a] to-[#176549] flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Tech Developers
                    </h1>
                    <p className="text-white/80">Kenya & East Africa</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Create Account
                    </h2>

                    {message && (
                        <div className={`mb-4 p-3 rounded-lg ${message.includes('pending')
                            ? 'bg-yellow-100 text-yellow-800'
                            : message.includes('success')
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {message}
                        </div>
                    )}

                    {/* Google Sign Up */}
                    <button
                        onClick={handleGoogleSignup}
                        className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-[#1f7a5a] hover:bg-gray-50 transition flex items-center justify-center gap-3 mb-6"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                        </div>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSignup} className="space-y-4">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                I am a...
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'client' })}
                                    className={`py-3 px-4 rounded-lg border-2 font-medium transition ${formData.role === 'client'
                                        ? 'border-[#1f7a5a] bg-[#1f7a5a] text-white'
                                        : 'border-gray-300 hover:border-[#1f7a5a]'
                                        }`}
                                >
                                    Client
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'commissioner' })}
                                    className={`py-3 px-4 rounded-lg border-2 font-medium transition ${formData.role === 'commissioner'
                                        ? 'border-[#1f7a5a] bg-[#1f7a5a] text-white'
                                        : 'border-gray-300 hover:border-[#1f7a5a]'
                                        }`}
                                >
                                    Commissioner
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'developer' })}
                                    className={`py-3 px-4 rounded-lg border-2 font-medium transition ${formData.role === 'developer'
                                        ? 'border-[#1f7a5a] bg-[#1f7a5a] text-white'
                                        : 'border-gray-300 hover:border-[#1f7a5a]'
                                        }`}
                                >
                                    Developer
                                </button>
                            </div>
                            {formData.role !== 'client' && (
                                <p className="text-xs text-yellow-600 mt-2">
                                    ⚠️ Requires admin approval before access
                                </p>
                            )}
                            {formData.referralCode && formData.role === 'commissioner' && (
                                <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm flex items-center gap-2">
                                    <span className="font-semibold">✓ Referral Active:</span> {formData.referralCode}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f7a5a] focus:border-transparent outline-none"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f7a5a] focus:border-transparent outline-none"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f7a5a] focus:border-transparent outline-none"
                                    placeholder="+254712345678"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f7a5a] focus:border-transparent outline-none"
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#1f7a5a] text-white rounded-lg font-semibold hover:bg-[#176549] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#1f7a5a] font-semibold hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-white hover:underline">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
