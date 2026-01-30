'use client';

import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';

interface PayDepositButtonProps {
    projectId: string;
    amount: number;
    email: string;
    className?: string;
}

export default function PayDepositButton({ projectId, amount, email, className }: PayDepositButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        try {
            setLoading(true);

            // 1. Initialize transaction on your Backend
            const res = await fetch('/api/payments/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, amount, email }),
            });

            const data = await res.json();

            if (data.authorization_url) {
                // 2. Redirect client to Paystack Checkout
                window.location.href = data.authorization_url;
            } else {
                alert('Payment initialization failed: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert('An error occurred during payment initialization.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
        >
            {loading ? (
                <span className="flex items-center gap-2">Processing...</span>
            ) : (
                <>
                    <Lock className="w-5 h-5" />
                    Pay 43% Deposit (KES {amount.toLocaleString()})
                </>
            )}
        </button>
    );
}
