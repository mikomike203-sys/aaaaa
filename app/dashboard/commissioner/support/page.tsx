import TicketList from '@/components/support/TicketList';
import { useState } from 'react';
import { Book, HelpCircle, LifeBuoy, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function CommissionerSupportPage() {
    const [tab, setTab] = useState<'tickets' | 'kb'>('kb');

    const kbArticles = [
        { title: 'The 5-Minute Pitch', category: 'Sales', time: '3 min read', icon: FileText },
        { title: 'Understanding Tiers', category: 'Platform', time: '5 min read', icon: Book },
        { title: 'Closing Your First Lead', category: 'Strategy', time: '10 min read', icon: LifeBuoy },
        { title: 'Service Pricing Guide 2026', category: 'Billing', time: '4 min read', icon: HelpCircle },
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Support & Knowledge</h2>
                    <p className="text-gray-500 mt-2 text-lg">Get help and learn how to maximize your agency income.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setTab('kb')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'kb' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                    >
                        Guides
                    </button>
                    <button
                        onClick={() => setTab('tickets')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'tickets' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                    >
                        Tickets
                    </button>
                </div>
            </div>

            {tab === 'kb' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kbArticles.map((article, idx) => (
                        <Card key={idx} className="p-6 hover:shadow-xl transition-shadow border-none bg-white cursor-pointer group">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                                <article.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{article.category}</span>
                            <h3 className="font-bold text-gray-900 mt-1 mb-2 leading-tight">{article.title}</h3>
                            <p className="text-xs text-gray-400">{article.time}</p>
                        </Card>
                    ))}

                    <Card className="md:col-span-2 lg:col-span-4 p-8 bg-indigo-900 text-white border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-4">Commissioner Video Bootcamp</h3>
                            <p className="text-indigo-200 mb-6 max-w-2xl">
                                Watch our 4-part series on how to effectively lead client discussions, negotiate budgets, and handle developer handovers.
                            </p>
                            <button className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition shadow-xl">
                                Watch Course
                            </button>
                        </div>
                    </Card>
                </div>
            ) : (
                <TicketList role="commissioner" />
            )}
        </div>
    );
}
