// Top Bar Component
'use client';

import { Search, Bell, ChevronDown, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
    const { data: session } = useSession();

    return (
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
            {/* Left Section: Mobile Menu & Search */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2.5 bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 rounded-2xl transition-all active:scale-95"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="hidden sm:block flex-1 max-w-lg">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Universal search..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-transparent rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-100 transition-all placeholder:text-gray-400 text-gray-700 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 md:gap-8">
                <button className="relative p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all active:scale-95">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                </button>

                <div className="h-10 w-px bg-gray-100 hidden md:block"></div>

                {/* Profile */}
                <button className="flex items-center gap-3 py-1.5 px-1.5 pr-4 rounded-3xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all active:scale-98">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-indigo-500/20">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-inner">
                            <span className="font-black text-indigo-600 text-sm">
                                {session?.user?.name ? session.user.name[0] : 'U'}
                            </span>
                        </div>
                    </div>

                    <div className="text-left hidden md:block">
                        <motion.p
                            className="text-sm font-black text-gray-900 leading-tight tracking-tight"
                            layout
                        >
                            {session?.user?.name || 'Authorized User'}
                        </motion.p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mt-0.5">
                            {(session?.user as any)?.role || 'Access Tier'}
                        </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-300 ml-1 hidden sm:block" />
                </button>
            </div>
        </header>
    );
}
