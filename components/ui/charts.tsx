'use client';

export function RevenueLineChart() {
    return (
        <div className="w-full h-48 relative pt-8">
            <svg viewBox="0 0 400 100" className="w-full h-full">
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="400" y2="20" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="#f3f4f6" strokeWidth="1" />

                {/* Data Line */}
                <path
                    d="M 0 80 Q 50 70, 100 85 T 200 60 T 300 30 T 400 10"
                    fill="none"
                    stroke="#1f7a5a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="animate-[draw_2s_ease-out_forwards]"
                    style={{ strokeDasharray: 500, strokeDashoffset: 500 }}
                />

                {/* Gradient Fill */}
                <path
                    d="M 0 80 Q 50 70, 100 85 T 200 60 T 300 30 T 400 10 L 400 100 L 0 100 Z"
                    fill="url(#greenGradient)"
                    className="opacity-20 translate-y-2"
                />

                <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1f7a5a" />
                        <stop offset="100%" stopColor="white" />
                    </linearGradient>
                </defs>

                {/* Data Points */}
                <circle cx="100" cy="85" r="4" fill="white" stroke="#1f7a5a" strokeWidth="2" />
                <circle cx="200" cy="60" r="4" fill="white" stroke="#1f7a5a" strokeWidth="2" />
                <circle cx="300" cy="30" r="4" fill="white" stroke="#1f7a5a" strokeWidth="2" />
                <circle cx="400" cy="10" r="4" fill="#1f7a5a" />
            </svg>
            <style jsx>{`
                @keyframes draw {
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </div>
    );
}

export function LeadBarChart() {
    const bars = [40, 70, 55, 90, 65, 80, 95];
    return (
        <div className="w-full h-48 flex items-baseline justify-between gap-2 pt-8 px-4">
            {bars.map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div
                        className="w-full bg-indigo-100 rounded-t-lg transition-all duration-700 origin-bottom hover:bg-[#5347CE] relative overflow-hidden"
                        style={{ height: `${height}%`, animation: `grow 1s ease-out ${i * 0.1}s forwards`, opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Day {i + 1}</span>
                </div>
            ))}
            <style jsx>{`
                @keyframes grow {
                    from { height: 0; opacity: 0; }
                    to { height: var(--h); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
