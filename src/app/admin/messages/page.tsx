'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Message } from '@/types';
import { toast } from 'sonner';

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    setMessages(data || []);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (msg: Message, read: boolean) => {
    const supabase = createClient();
    await supabase.from('messages').update({ read }).eq('id', msg.id);
    load();
    if (!read) setSelected(null);
  };

  const deleteMsg = async (id: string) => {
    if (!confirm('Delete message?')) return;
    const supabase = createClient();
    await supabase.from('messages').delete().eq('id', id);
    load();
    setSelected(null);
    toast.success('Message deleted');
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="mb-10">
          <div className="text-xs tracking-[3px] text-zinc-500 mb-1">INBOX</div>
          <h1 className="text-5xl tracking-tighter font-semibold">Messages</h1>
        </div>

        <div className="bg-white border rounded-3xl overflow-hidden">
          {messages.length === 0 && <div className="p-12 text-center text-zinc-400">No messages yet.</div>}
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              onClick={() => setSelected(msg)}
              className={`p-7 border-b last:border-b-0 cursor-pointer flex items-start gap-6 hover:bg-zinc-50 ${selected?.id === msg.id ? 'bg-zinc-50' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="font-semibold tracking-tight text-xl truncate">{msg.name}</div>
                  {!msg.read && <div className="px-3 py-px rounded-full text-xs bg-black text-white">NEW</div>}
                </div>
                <div className="text-sm text-zinc-500 mt-px">{msg.email}</div>
                <div className="line-clamp-1 text-zinc-600 mt-4 text-sm pr-8">{msg.message}</div>
              </div>
              <div className="text-xs text-right text-zinc-400 whitespace-nowrap pt-1">
                {new Date(msg.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-[380px] bg-white border rounded-3xl p-9 h-fit sticky top-8">
          <div className="text-xs tracking-widest text-zinc-400 mb-4">FROM</div>
          <div className="font-semibold text-3xl tracking-tight">{selected.name}</div>
          <a href={`mailto:${selected.email}`} className="text-sm text-zinc-500 hover:underline">{selected.email}</a>

          {selected.subject && <div className="mt-9"><div className="text-xs tracking-widest text-zinc-400 mb-1">SUBJECT</div><div className="font-medium">{selected.subject}</div></div>}

          <div className="mt-9">
            <div className="text-xs tracking-widest text-zinc-400 mb-3">MESSAGE</div>
            <div className="text-[15px] leading-relaxed text-zinc-700 whitespace-pre-wrap">{selected.message}</div>
          </div>

          <div className="flex gap-3 mt-12">
            <button onClick={() => markRead(selected, !selected.read)} className="flex-1 py-4 rounded-2xl border text-sm">
              Mark as {selected.read ? 'unread' : 'read'}
            </button>
            <button onClick={() => deleteMsg(selected.id)} className="flex-1 py-4 rounded-2xl bg-red-600 text-white text-sm">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
