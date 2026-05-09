'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import gsap from 'gsap';
import Link from 'next/link';
import { prefersReducedMotion } from '@/components/animations/prefersReducedMotion';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = stageRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const parts = root.querySelectorAll('[data-login-reveal]');
      gsap.from(parts, {
        y: 24,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power3.out',
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured()) {
      toast.error('Supabase env vars are missing. Configure .env.local and restart dev server.');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back');
      router.push('/admin');
    }
    setLoading(false);
  };

  const inputCls =
    'w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-[15px] tracking-tight text-white placeholder:text-white/38 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/55';

  return (
    <div ref={stageRef} className="relative min-h-screen overflow-hidden bg-[#0D1B2A] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.75]"
        style={{
          backgroundImage:
            'radial-gradient(900px circle at 15% 0%, rgba(212, 175, 55, 0.28), transparent 48%), radial-gradient(700px circle at 90% 10%, rgba(255, 255, 255, 0.08), transparent 45%)',
        }}
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-7 py-16">
        <div data-login-reveal className="mb-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-[#D4AF37]/90">Restricted</p>
          <div className="mt-4 text-5xl font-semibold tracking-tight">VISILY</div>
          <p className="mt-3 text-[13px] font-medium uppercase tracking-[0.24em] text-white/52">Admin sign in</p>
        </div>

        <form data-login-reveal onSubmit={handleLogin} className="space-y-4">
          {!isSupabaseConfigured() && (
            <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-50">
              Supabase is not configured. Add valid <code className="rounded bg-black/20 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code className="rounded bg-black/20 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="rounded bg-black/20 px-1">.env.local</code>, then restart the server.
            </div>
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputCls}
            required
            disabled={!isSupabaseConfigured()}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputCls}
            required
            disabled={!isSupabaseConfigured()}
          />
          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured()}
            className="w-full rounded-2xl bg-[#D4AF37] py-4 text-[15px] font-semibold tracking-tight text-[#0D1B2A] shadow-[0_18px_50px_-28px_rgba(212,175,55,0.75)] transition hover:bg-[#e0bc4a] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p data-login-reveal className="mt-10 text-center text-xs text-white/45">
          Protected area. Authorized access only.
        </p>
        <p data-login-reveal className="mt-6 text-center text-sm text-white/55">
          <Link href="/" className="font-medium text-[#D4AF37] hover:text-[#e6c35c]">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
