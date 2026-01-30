'use client';

import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ApprovalActionButtonsProps {
    id: string;
    type: 'commissioner' | 'developer';
    name: string;
}

export default function ApprovalActionButtons({ id, type, name }: ApprovalActionButtonsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} ${name}?`)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/approvals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type, action })
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert('Action failed. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-3 w-full">
            <button
                onClick={() => handleAction('reject')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium disabled:opacity-50"
            >
                <X className="w-4 h-4" /> Reject
            </button>
            <button
                onClick={() => handleAction('approve')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approve
            </button>
        </div>
    );
}
