'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface ReferralLinkProps {
    referralCode: string;
}

export function ReferralLink({ referralCode }: ReferralLinkProps) {
    const [copied, setCopied] = useState(false);

    const referralUrl = `${window.location.origin}/join?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[var(--bg-input)] rounded-xl p-4">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Your Referral Link
            </p>
            <div className="flex items-center gap-2">
                <code className="flex-1 bg-[var(--bg-card)] px-4 py-3 rounded-lg text-sm font-mono text-[var(--text-primary)] border border-[var(--bg-input)]">
                    {referralUrl}
                </code>
                <button
                    onClick={handleCopy}
                    className="px-4 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 font-bold whitespace-nowrap"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
