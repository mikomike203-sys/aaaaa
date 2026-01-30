// Sidebar Navigation Component
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CreditCard,
    Briefcase,
    Shield,
    Settings,
    User,
    Users,
    Search,
    MessageSquare,
    Target,
    Megaphone,
    BookOpen,
    LogOut,
    Bell,
    FileText,
    X
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = {
    // ... items stay the same ...
    admin: [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/admin' },
        { name: 'Approvals', icon: Shield, href: '/dashboard/admin/approvals' },
        { name: 'Payments', icon: CreditCard, href: '/dashboard/admin/payments' },
        { name: 'Ledger', icon: FileText, href: '/dashboard/admin/ledger' },
        { name: 'Projects', icon: Briefcase, href: '/dashboard/admin/projects' },
        { name: 'Users', icon: Users, href: '/dashboard/admin/users' },
        { name: 'Knowledge Base', icon: BookOpen, href: '/dashboard/kb' },
        { name: 'Profile', icon: User, href: '/dashboard/profile' },
    ],
    client: [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/client' },
        { name: 'Messages', icon: MessageSquare, href: '/dashboard/client/messages' },
        { name: 'Find Talent', icon: Search, href: '/dashboard/client/discovery' },
        { name: 'My Projects', icon: Briefcase, href: '/dashboard/client/projects' },
        { name: 'Knowledge Base', icon: BookOpen, href: '/dashboard/kb' },
        { name: 'Payments', icon: CreditCard, href: '/dashboard/client/payments' },
        { name: 'Profile', icon: User, href: '/dashboard/profile' },
    ],
    commissioner: [
        { name: 'Dashboard', href: '/dashboard/commissioner', icon: LayoutDashboard },
        { name: 'Leads', href: '/dashboard/commissioner/leads', icon: Target },
        { name: 'Marketing', href: '/dashboard/commissioner/marketing', icon: Megaphone },
        { name: 'Knowledge Base', href: '/dashboard/kb', icon: BookOpen },
        { name: 'Team', href: '/dashboard/commissioner/team', icon: Users },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
        { name: 'Messages', href: '/dashboard/commissioner/messages', icon: MessageSquare },
        { name: 'Invoices', href: '/dashboard/commissioner/invoices', icon: CreditCard },
    ],
    developer: [
        { name: 'Work Queue', icon: LayoutDashboard, href: '/dashboard/developer' },
        { name: 'Messages', icon: MessageSquare, href: '/dashboard/developer/messages' },
        { name: 'Active Jobs', icon: Briefcase, href: '/dashboard/developer/jobs' },
        { name: 'Knowledge Base', icon: BookOpen, href: '/dashboard/kb' },
        { name: 'Earnings', icon: CreditCard, href: '/dashboard/developer/earnings' },
        { name: 'Profile', icon: User, href: '/dashboard/profile' },
    ]
};

export function Sidebar({
    role,
    isOpen,
    onClose
}: {
    role: 'admin' | 'client' | 'commissioner' | 'developer';
    isOpen: boolean;
    onClose: () => void;
}) {
    const pathname = usePathname();
    const items = menuItems[role] || [];

    const sidebarVariants = {
        open: { x: 0, opacity: 1 },
        closed: { x: '-100%', opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />

                    <motion.aside
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-72 bg-white border-r border-gray-100 h-[100dvh] fixed left-0 top-0 flex flex-col z-50 shadow-2xl lg:shadow-none"
                    >
                        {/* Brand */}
                        <div className="p-8 pb-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tighter">
                                    Nexus
                                </h1>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">Workspace Engine</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-5 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                Main Navigation
                            </p>

                            {items.map((item, idx) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => {
                                            if (window.innerWidth < 1024) onClose();
                                        }}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                            ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200'
                                            : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        <span className="text-sm tracking-tight">{item.name}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Footer */}
                        <div className="mt-auto p-6 border-t border-gray-50 space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Appearance</span>
                                <ThemeToggle />
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="flex items-center gap-4 px-4 py-4 w-full rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group font-bold text-sm"
                            >
                                <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                <span>Logout System</span>
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
