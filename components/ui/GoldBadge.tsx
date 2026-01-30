import { CheckCircle2 } from 'lucide-react';

interface GoldBadgeProps {
    tier?: 'bronze' | 'silver' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export function GoldBadge({ tier, size = 'md', showLabel = false }: GoldBadgeProps) {
    if (tier !== 'gold') return null;

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <div className="inline-flex items-center gap-1">
            <div className="relative">
                <CheckCircle2
                    className={`${sizeClasses[size]} text-blue-500 fill-blue-500`}
                />
            </div>
            {showLabel && (
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                    Verified
                </span>
            )}
        </div>
    );
}
