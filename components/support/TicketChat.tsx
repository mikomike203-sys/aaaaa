'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User, Lock } from 'lucide-react';

export default function TicketChat({ ticketId, currentUserId }: { ticketId: string, currentUserId: string }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        const res = await fetch(`/api/support/tickets/${ticketId}/messages`);
        const data = await res.json();
        if (data.success) setMessages(data.data);
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [ticketId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            await fetch(`/api/support/tickets/${ticketId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ message: newMessage })
            });
            setNewMessage('');
            fetchMessages();
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    const isAdmin = msg.sender?.role === 'admin';

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${isMe
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : isAdmin
                                        ? 'bg-gray-900 text-white rounded-bl-none'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                }`}>
                                <div className="text-xs mb-1 opacity-70 flex justify-between gap-4">
                                    <span className="font-bold">{msg.sender?.name}</span>
                                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex gap-4">
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg shadow-indigo-200"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
