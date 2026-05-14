'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Message } from '@/types';
import { toast } from 'sonner';
import { Mail, MessageCircle, Send, CheckCheck, Trash2, MailOpen } from 'lucide-react';

function whatsappHref(raw: string) {
  const digits = raw.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    setMessages(data || []);
  };

  useEffect(() => { load(); }, []);

  const selectMessage = (msg: Message) => {
    setSelected(msg);
    setReplyText('');
    // Auto-mark as read when opened
    if (!msg.read) markRead(msg, true);
  };

  const markRead = async (msg: Message, read: boolean) => {
    const supabase = createClient();
    await supabase.from('messages').update({ read }).eq('id', msg.id);
    load();
    if (!read) setSelected(null);
  };

  const deleteMsg = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    const supabase = createClient();
    await supabase.from('messages').delete().eq('id', id);
    load();
    setSelected(null);
    toast.success('Message deleted');
  };

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      const res = await fetch('/api/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: selected.id, replyText: replyText.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');

      if (json.emailSent) {
        toast.success('Reply sent and email delivered!');
      } else if (selected.email) {
        toast.success('Reply saved. (Connect Gmail in Settings to also send emails.)');
      } else {
        toast.success('Reply saved.');
      }
      setReplyText('');
      await load();
      // Refresh selected with updated data
      const supabase = createClient();
      const { data } = await supabase.from('messages').select('*').eq('id', selected.id).single();
      if (data) setSelected(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="flex gap-6 items-start">
      {/* Message list */}
      <div className="flex-1 min-w-0">
        <div className="mb-10">
          <div className="text-xs tracking-[3px] text-zinc-500 mb-1">INBOX</div>
          <h1 className="text-5xl tracking-tighter font-semibold">
            Messages
            {unreadCount > 0 && (
              <span className="ml-3 text-lg font-medium px-3 py-1 rounded-full bg-black text-white align-middle">
                {unreadCount}
              </span>
            )}
          </h1>
        </div>

        <div className="bg-white border rounded-3xl overflow-hidden">
          {messages.length === 0 && (
            <div className="p-12 text-center text-zinc-400">No messages yet.</div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => selectMessage(msg)}
              className={`p-7 border-b last:border-b-0 cursor-pointer flex items-start gap-6 hover:bg-zinc-50 transition-colors ${
                selected?.id === msg.id ? 'bg-zinc-50' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="font-semibold tracking-tight text-xl truncate">{msg.name}</div>
                  {!msg.read && (
                    <div className="px-3 py-px rounded-full text-xs bg-black text-white shrink-0">NEW</div>
                  )}
                  {msg.replied_at && (
                    <div className="px-3 py-px rounded-full text-xs bg-emerald-100 text-emerald-700 shrink-0 flex items-center gap-1">
                      <CheckCheck className="h-3 w-3" />
                      Replied
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {msg.email && (
                    <span className="text-sm text-zinc-500 flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {msg.email}
                    </span>
                  )}
                  {msg.whatsapp && (
                    <span className="text-sm text-emerald-600 flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {msg.whatsapp}
                    </span>
                  )}
                </div>
                <div className="line-clamp-1 text-zinc-600 mt-3 text-sm pr-8">{msg.message}</div>
              </div>
              <div className="text-xs text-right text-zinc-400 whitespace-nowrap pt-1 shrink-0">
                {new Date(msg.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail + Reply panel */}
      {selected && (
        <div className="w-[420px] shrink-0 bg-white border rounded-3xl p-9 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Contact info */}
          <div className="text-xs tracking-widest text-zinc-400 mb-4">FROM</div>
          <div className="font-semibold text-2xl tracking-tight">{selected.name}</div>

          <div className="mt-3 flex flex-col gap-2">
            {selected.email && (
              <a
                href={`mailto:${selected.email}`}
                className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition-colors"
              >
                <Mail className="h-4 w-4 text-zinc-400" />
                {selected.email}
              </a>
            )}
            {selected.whatsapp && whatsappHref(selected.whatsapp) && (
              <a
                href={whatsappHref(selected.whatsapp)!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
              >
                <MessageCircle className="h-4 w-4" />
                {selected.whatsapp}
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  Open WhatsApp ↗
                </span>
              </a>
            )}
          </div>

          {selected.subject && (
            <div className="mt-7">
              <div className="text-xs tracking-widest text-zinc-400 mb-1">SUBJECT</div>
              <div className="font-medium text-sm">{selected.subject}</div>
            </div>
          )}

          <div className="mt-7">
            <div className="text-xs tracking-widest text-zinc-400 mb-3">MESSAGE</div>
            <div className="text-[14px] leading-relaxed text-zinc-700 whitespace-pre-wrap bg-zinc-50 rounded-2xl p-4">
              {selected.message}
            </div>
          </div>

          {/* Previous reply */}
          {selected.admin_reply && (
            <div className="mt-7">
              <div className="text-xs tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                YOUR REPLY
                {selected.replied_at && (
                  <span className="ml-auto text-zinc-300">
                    {new Date(selected.replied_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="text-[14px] leading-relaxed text-zinc-600 whitespace-pre-wrap bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                {selected.admin_reply}
              </div>
            </div>
          )}

          {/* Reply textarea */}
          <div className="mt-7">
            <div className="text-xs tracking-widest text-zinc-400 mb-3">
              {selected.admin_reply ? 'SEND ANOTHER REPLY' : 'REPLY'}
            </div>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={
                selected.email
                  ? 'Type your reply… it will be emailed to the customer.'
                  : 'Type your reply… (no email on file; use WhatsApp to reach out)'
              }
              rows={4}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-[14px] text-zinc-800 placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-black/10"
            />
            <button
              onClick={sendReply}
              disabled={replying || !replyText.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
            >
              <Send className="h-4 w-4" />
              {replying ? 'Sending…' : selected.email ? 'Send reply + email customer' : 'Save reply'}
            </button>
            {!selected.email && selected.whatsapp && (
              <p className="mt-2 text-xs text-zinc-400 text-center">
                No email — use the WhatsApp button above to chat directly.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-7">
            <button
              onClick={() => markRead(selected, !selected.read)}
              className="flex-1 py-3.5 rounded-2xl border text-sm flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors"
            >
              <MailOpen className="h-4 w-4" />
              Mark as {selected.read ? 'unread' : 'read'}
            </button>
            <button
              onClick={() => deleteMsg(selected.id)}
              className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white text-sm flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
