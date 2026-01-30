'use client';

import { Triangle } from 'lucide-react';

export default function LoadingTriangle({ fullPage = true }: { fullPage?: boolean }) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <Triangle
                    className="w-16 h-16 text-[#1f7a5a] animate-[spin_3s_linear_infinite]"
                    strokeWidth={1.5}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#1f7a5a] rounded-full animate-ping"></div>
                </div>
            </div>
            <p className="text-gray-500 font-medium animate-pulse">Loading Workspace...</p>
        </div>
    );

    if (fullPage) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FA]">
                {content}
            </div>
        );
    }

    return content;
}
