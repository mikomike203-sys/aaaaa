'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { supabaseClient } from '@/lib/db';
import { Send, User as UserIcon, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    sender?: {
        name: string;
        role: string;
        avatar_url?: string;
    };
}

interface ProjectChatProps {
    projectId: string;
    currentUserId: string;
}

export default function ProjectChat({ projectId, currentUserId }: ProjectChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { data: session } = useSession();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!projectId) return;

        const fetchMessages = async () => {
            try {
                const { data, error } = await supabaseClient
                    .from('messages')
                    .select(`
                        *,
                        sender:users (
                            name,
                            role,
                            avatar_url
                        )
                    `)
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setMessages(data || []);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Realtime Subscription
        const channel = supabaseClient
            .channel(`project_chat:${projectId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `project_id=eq.${projectId}`
            }, async (payload) => {
                // Fetch the new message with sender details
                const { data: newMsg, error } = await supabaseClient
                    .from('messages')
                    .select(`
                        *,
                        sender:users (
                            name,
                            role,
                            avatar_url
                        )
                    `)
                    .eq('id', payload.new.id)
                    .single();

                if (!error && newMsg) {
                    setMessages((prev) => [...prev, newMsg]);
                }
            })
            .subscribe();

        return () => {
            supabaseClient.removeChannel(channel);
        };
    }, [projectId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempData = {
            project_id: projectId,
            sender_id: currentUserId,
            content: newMessage,
        };

        // Optimistic UI update could be added here, but relying on Realtime is safer for now
        setNewMessage('');

        try {
            const { error } = await supabaseClient
                .from('messages')
                .insert(tempData);

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    };

    return (
        <Card className="flex flex-col h-[600px] border-none shadow-none bg-[var(--bg-card)]">
            <div className="p-4 border-b border-[var(--bg-input)]">
                <h3 className="font-bold text-[var(--text-primary)]">Project Communication</h3>
                <p className="text-xs text-[var(--text-secondary)]">Secure channel between Commissioner, Developer & Client</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-50">
                        <MessageSquareIcon className="w-12 h-12 mb-2" />
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-input)] text-[var(--text-secondary)]'
                                    }`}>
                                    {msg.sender?.avatar_url ? (
                                        <img src={msg.sender.avatar_url} alt={msg.sender.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        msg.sender?.name?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />
                                    )}
                                </div>
                                <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-[var(--text-primary)]">
                                            {isMe ? 'You' : msg.sender?.name}
                                        </span>
                                        <span className="text-[10px] text-[var(--text-secondary)]">
                                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className={`px-4 py-2 rounded-2xl text-sm ${isMe
                                        ? 'bg-[var(--primary)] text-white rounded-tr-none'
                                        : 'bg-[var(--bg-input)] text-[var(--text-primary)] rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)]">
                                        {msg.sender?.role}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--bg-input)] flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 bg-[var(--bg-app)] border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none text-[var(--text-primary)]"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </Card>
    );
}

function MessageSquareIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}
