"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    is_internal: boolean;
    created_at: string;
    sender?: {
        name: string;
        role: string;
    };
}

export default function ChatBox({ projectId, userId, userRole }: { projectId: string; userId: string; userRole: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const supabase = createClient();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`project-chat:${projectId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` },
                (payload: { new: any }) => {
                    const msg = payload.new as Message;
                    // If client, don't show internal messages
                    if (userRole === 'client' && msg.is_internal) return;
                    setMessages((prev) => [...prev, msg]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [projectId, userRole, supabase]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    async function fetchMessages() {
        let query = supabase
            .from('messages')
            .select(`
                *,
                sender:sender_id(name, role)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        // Filter internal messages for clients
        if (userRole === 'client') {
            query = query.eq('is_internal', false);
        }

        const { data } = await query;
        if (data) setMessages(data as any[]);
    }

    async function sendMessage() {
        if (!newMessage.trim()) return;

        const { error } = await supabase.from('messages').insert({
            project_id: projectId,
            sender_id: userId,
            content: newMessage,
            is_internal: (userRole === 'admin' || userRole === 'developer') ? isInternal : false
        });

        if (!error) {
            setNewMessage("");
            // Optimistic update locally if needed, or let realtime handle it
        }
    }

    return (
        <div className="flex flex-col h-[500px] border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#1f7a5a]" /> Project Workspace
                </h3>
                {(userRole === 'admin' || userRole === 'developer') && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Internal Only</span>
                        <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="w-4 h-4 accent-[#1f7a5a] cursor-pointer"
                        />
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender_id === userId ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                    {(msg.sender as any)?.name || 'Team'}
                                </span>
                                {msg.is_internal && (
                                    <span title="Internal Note">
                                        <ShieldCheck className="w-3 h-3 text-amber-500" />
                                    </span>
                                )}
                            </div>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender_id === userId
                                ? 'bg-[#1f7a5a] text-white rounded-tr-none'
                                : msg.is_internal
                                    ? 'bg-amber-50 text-amber-900 border border-amber-100 rounded-tl-none'
                                    : 'bg-slate-100 text-slate-900 rounded-tl-none'
                                }`}>
                                {msg.content}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-top border-slate-100 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={isInternal ? "Write internal note..." : "Message team..."}
                        className={`flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 transition-all ${isInternal ? 'border-amber-200 focus:ring-amber-500/20 bg-amber-50/50' : 'border-slate-200 focus:ring-[#1f7a5a]/20'
                            }`}
                    />
                    <Button
                        size="icon"
                        onClick={sendMessage}
                        className={`rounded-full shadow-sm transition-all ${isInternal ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#1f7a5a] hover:bg-[#165e44]'
                            }`}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function MessageSquare(props: any) {
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
