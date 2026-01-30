'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
    Send,
    Search,
    MoreVertical,
    User,
    MessageSquare,
    Phone,
    Video,
    Smile,
    Paperclip,
    Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MessagingPage() {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConv, setSelectedConv] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await fetch('/api/messages');
                const result = await response.json();
                if (result.success) {
                    setConversations(result.data);
                    if (result.data.length > 0) setSelectedConv(result.data[0]);
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchConversations();
    }, [session]);

    useEffect(() => {
        if (selectedConv) {
            const fetchMessages = async () => {
                const response = await fetch(`/api/messages?conversationId=${selectedConv.id}`);
                const result = await response.json();
                if (result.success) {
                    setMessages(result.data);
                }
            };
            fetchMessages();
        }
    }, [selectedConv]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv) return;

        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            content: newMessage,
            sender_id: (session?.user as any).id,
            created_at: new Date().toISOString(),
            sender: { name: session?.user?.name }
        };

        setMessages([...messages, optimisticMsg]);
        const msgToSend = newMessage;
        setNewMessage('');

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify({
                    conversationId: selectedConv.id,
                    content: msgToSend
                })
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(messages.filter(m => m.id !== optimisticMsg.id));
        }
    };

    if (loading) return (
        <div className="flex h-[calc(100vh-120px)] items-center justify-center bg-white rounded-3xl border border-gray-100 animate-pulse">
            <div className="text-center space-y-4">
                <MessageSquare className="w-12 h-12 text-gray-200 mx-auto" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Initializing Secure Channel...</p>
            </div>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-2xl shadow-indigo-100/20">
            {/* Sidebar - Conversation List */}
            <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
                <div className="p-6">
                    <h2 className="text-xl font-black text-gray-900 mb-6">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter chats..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-2 pb-6">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedConv(conv)}
                                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 ${selectedConv?.id === conv.id
                                    ? 'bg-white shadow-xl shadow-indigo-100 border border-indigo-50'
                                    : 'hover:bg-white/50 border border-transparent'
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                        {conv.title?.[0] || 'G'}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-bold text-gray-900 truncate w-32">{conv.title || 'General Chat'}</p>
                                        <span className="text-[10px] text-gray-400 font-bold">12:30 PM</span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate w-32 font-medium">Click to view messages...</p>
                                </div>
                            </button>
                        ))}
                        {conversations.length === 0 && (
                            <div className="text-center py-12 text-gray-400 italic text-sm">No conversations yet.</div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                    {selectedConv.title?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight">{selectedConv.title}</h3>
                                    <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400">
                                <Phone className="w-5 h-5 cursor-not-allowed hover:text-gray-600 transition-colors" />
                                <Video className="w-5 h-5 cursor-not-allowed hover:text-gray-600 transition-colors" />
                                <div className="h-4 w-px bg-gray-100 mx-2"></div>
                                <MoreVertical className="w-5 h-5 cursor-pointer hover:text-gray-900 transition-colors" />
                            </div>
                        </div>

                        {/* Messages Display */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30"
                        >
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender_id === (session?.user as any).id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] group ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                {!isMe && <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-2">{msg.sender?.name}</span>}
                                                <span className="text-[10px] text-gray-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-gray-100">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                                <button type="button" className="p-3 text-gray-400 hover:text-indigo-600 transition-colors bg-gray-50 rounded-xl invisible md:visible">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message here..."
                                        className="w-full pl-6 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-gray-400"
                                    />
                                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-12 h-12 text-gray-200" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Your Communication Hub</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-2 leading-relaxed">
                                Connect with clients, developers, and commissioners instantly. Select a chat from the sidebar to begin.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
