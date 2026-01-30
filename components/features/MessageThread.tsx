'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    sender: {
        name: string;
        role: string;
    };
}

interface MessageThreadProps {
    conversationId: string;
}

export function MessageThread({ conversationId }: MessageThreadProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 3 seconds
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/messages?conversationId=${conversationId}`);
            const result = await response.json();
            if (result.success) {
                setMessages(result.data || []);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    content: newMessage.trim(),
                }),
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const currentUserId = (session?.user as any)?.id;

    if (loading) {
        return (
            <Card className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg) => {
                        const isOwn = msg.sender_id === currentUserId;

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] ${isOwn
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'bg-[var(--bg-input)] text-[var(--text-primary)]'
                                        } rounded-2xl px-4 py-3 shadow-sm`}
                                >
                                    {!isOwn && (
                                        <p className="text-xs font-semibold mb-1 opacity-70">
                                            {msg.sender.name}
                                        </p>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap break-words">
                                        {msg.content}
                                    </p>
                                    <p
                                        className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-[var(--text-secondary)]'
                                            }`}
                                    >
                                        {new Date(msg.created_at).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-[var(--bg-input)] p-4">
                <form onSubmit={handleSend} className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={sending}
                        className="flex-1 px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)] disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
            </div>
        </Card>
    );
}
