// Pending Approval Page
'use client';

import Link from 'next/link';
import { Clock, Mail } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function PendingApprovalPage() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1f7a5a] to-[#176549] flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-yellow-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Account Pending Approval
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 mb-6">
                        Thank you for registering, <strong>{session?.user?.name}</strong>!
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-gray-700 mb-2">
                            Your account is currently being reviewed by our admin team. This typically takes <strong>24-48 hours</strong>.
                        </p>
                        <p className="text-sm text-gray-700">
                            You'll receive an email at <strong>{session?.user?.email}</strong> once your account is approved.
                        </p>
                    </div>

                    {/* What's Next */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            What happens next?
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li>✓ Admin reviews your registration</li>
                            <li>✓ You receive approval email</li>
                            <li>✓ Login and access your dashboard</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Sign Out
                        </button>

                        <Link
                            href="/"
                            className="block w-full py-3 bg-[#1f7a5a] text-white rounded-lg hover:bg-[#176549] transition text-center"
                        >
                            Back to Home
                        </Link>
                    </div>

                    {/* Support */}
                    <p className="text-sm text-gray-500 mt-6">
                        Questions? Contact us at{' '}
                        <a href="mailto:support@techdevelopers.ke" className="text-[#1f7a5a] hover:underline">
                            support@techdevelopers.ke
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
