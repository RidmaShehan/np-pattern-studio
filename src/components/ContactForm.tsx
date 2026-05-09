'use client';

import { FormEvent, useState } from 'react';
import { cn } from '@/lib/utils';
import { btnPrimary, cardSurface } from '@/lib/publicStyles';

const inputClass =
  'h-12 w-full rounded-2xl border border-[#0D1B2A]/10 bg-white/80 px-4 text-[15px] text-[#0D1B2A] placeholder:text-[#555555]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Pattern Development (CAD & Manual)',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed request');
      }

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: 'Pattern Development (CAD & Manual)',
        message: '',
      });
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={onSubmit} className={cn(cardSurface, 'mt-8 p-6 md:p-9')}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-[#0D1B2A]">Send a message</h2>
        <p className="mt-1 text-[15px] text-[#555555]">
          Include materials, timelines, or technical notes—we&apos;ll reply shortly.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          required
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          placeholder="Full name"
          className={inputClass}
        />
        <input
          required
          type="email"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email or WhatsApp"
          className={inputClass}
        />
      </div>
      <input
        value={formData.subject}
        onChange={e => setFormData({ ...formData, subject: e.target.value })}
        placeholder="Desired service"
        className={cn(inputClass, 'mt-4')}
      />
      <textarea
        required
        minLength={10}
        value={formData.message}
        onChange={e => setFormData({ ...formData, message: e.target.value })}
        placeholder="Describe your vision, materials, or technical requirements..."
        className={cn(inputClass, 'mt-4 min-h-36 resize-y py-3')}
      />
      <button type="submit" disabled={status === 'sending'} className={cn(btnPrimary, 'mt-6 w-full md:w-auto md:min-w-[200px]', 'disabled:opacity-60')}>
        {status === 'sending' ? 'Sending…' : status === 'success' ? 'Sent successfully' : 'Send project inquiry'}
      </button>
      {status === 'error' ? (
        <p className="mt-3 text-sm font-medium text-red-600">
          Unable to send right now. Please try again.
        </p>
      ) : null}
    </form>
  );
}
