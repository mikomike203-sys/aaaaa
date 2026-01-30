'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { MessageSquare, Loader2, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MessageThread } from '@/components/features/MessageThread';

interface Conversation {
    id: string;
    title: string;
    participants: Array<{
        user: {
            id: string;
            name: string;
            avatar_url?: string;
        };
    }>;
}

export default function DeveloperMessagesPage() {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/messages');
            const result = await response.json();
            if (result.success) {
                setConversations(result.data || []);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setLoading(false);
        }
    };

    const getOtherParticipant = (conv: Conversation) => {
        const userId = (session?.user as any)?.id;
        return conv.participants?.find((p) => p.user.id !== userId)?.user;
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6">
            <div className="w-80 flex-shrink-0">
                <Card className="h-full p-4 flex flex-col">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6" />
                        Team Messages
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {conversations.length === 0 ? (
                            <div className="text-center py-12"><MessageSquare className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" /><p className="text-[var(--text-secondary)] text-sm">No conversations</p></div>
                        ) : (
                            conversations.map((conv) => {
                                const otherUser = getOtherParticipant(conv);
                                const isSelected = selectedConversation === conv.id;
                                return (
                                    <button key={conv.id} onClick={() => setSelectedConversation(conv.id)} className={`w-full p-4 rounded-xl text-left transition-all ${isSelected ? 'bg-[var(--primary)]/10 border-2 border-[var(--primary)]' : 'bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 border-2 border-transparent'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">{otherUser?.avatar_url ? <img src={otherUser.avatar_url} alt={otherUser.name} className="w-full h-full rounded-full object-cover" /> : <User className="w-5 h-5 text-[var(--primary)]" />}</div>
                                            <div className="flex-1 min-w-0"><p className="font-semibold text-[var(--text-primary)] truncate">{otherUser?.name || 'Unknown'}</p><p className="text-xs text-[var(--text-secondary)] truncate">{conv.title}</p></div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </Card>
            </div>
            <div className="flex-1">{selectedConversation ? <MessageThread conversationId={selectedConversation} /> : <Card className="h-full flex items-center justify-center"><div className="text-center"><MessageSquare className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-30" /><p className="text-[var(--text-secondary)]">Select a conversation</p></div></Card>}</div>
        </div>
    );
}
