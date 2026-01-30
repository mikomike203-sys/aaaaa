// Reusable Soft UI Card
import React from 'react';

interface CardProps {
    children?: React.ReactNode;
    className?: string;
    noHover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className = '', noHover = false, onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-[16px] shadow-[0_4px_20px_-2px_rgba(83,71,206,0.08)] border border-white/50 p-6 ${!noHover ? 'hover:translate-y-[-2px] hover:shadow-[0_10px_25px_-5px_rgba(83,71,206,0.15)] transition-all duration-300' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <h3 className={`text-lg font-bold text-gray-900 ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`p-0 ${className}`}>{children}</div>;
}
