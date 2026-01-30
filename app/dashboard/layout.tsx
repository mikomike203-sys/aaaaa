'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Handle initial sidebar state based on screen size
        if (window.innerWidth >= 1024) {
            setIsSidebarOpen(true);
        }
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Nexus Authenticating</p>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        redirect('/login');
    }

    const role = (session?.user as any)?.role || 'client';

    return (
        <div className="min-h-[100dvh] bg-gray-50/50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navigation Components */}
            <Sidebar
                role={role}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Viewport Container */}
            <div className={`flex flex-col min-h-[100dvh] transition-all duration-500 ease-in-out ${isSidebarOpen ? 'lg:pl-72' : 'pl-0'}`}>
                <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* Content Stream */}
                <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                {/* Mobile Tab Bar Overlay (Vibrant Accents) */}
                <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-gray-100 px-6 py-3 rounded-3xl shadow-2xl flex items-center gap-8 z-30">
                    <button className="text-indigo-600"><span className="text-[10px] font-black uppercase tracking-tighter">Live Support</span></button>
                    <div className="w-px h-4 bg-gray-100"></div>
                    <button className="text-gray-400 font-bold text-xs">Knowledge Hub</button>
                </div>
            </div>
        </div>
    );
}
