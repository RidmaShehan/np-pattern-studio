'use client';

import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  LayoutDashboard,
  LayoutGrid,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  FileText,
} from 'lucide-react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/components/animations/prefersReducedMotion';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/admin/login');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.push('/admin/login');
    });

    return () => subscription.unsubscribe();
  }, [isLoginPage, router]);

  useLayoutEffect(() => {
    if (isLoginPage || loading || !user) return;
    const root = shellRef.current;
    if (!root || prefersReducedMotion()) return;

    const sidebar = root.querySelector('[data-admin-sidebar]');
    const main = root.querySelector('[data-admin-main]');
    const navLinks = root.querySelectorAll('[data-admin-nav-link]');
    const topbar = root.querySelector('[data-admin-topbar]');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (sidebar) tl.from(sidebar, { x: -24, autoAlpha: 0, duration: 0.55 }, 0);
      if (main) tl.from(main, { y: 18, autoAlpha: 0, duration: 0.55 }, 0.05);
      if (topbar) tl.from(topbar, { y: -10, autoAlpha: 0, duration: 0.45 }, 0.12);
      if (navLinks.length) tl.from(navLinks, { x: -14, autoAlpha: 0, stagger: 0.05, duration: 0.4 }, 0.12);
    }, root);

    return () => ctx.revert();
  }, [isLoginPage, loading, user]);

  const handleSignOut = async () => {
    if (!isSupabaseConfigured()) {
      router.push('/admin/login');
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC] text-[#0D1B2A]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-pulse rounded-2xl bg-[#0D1B2A]/10 ring-1 ring-[#0D1B2A]/10" />
          <p className="text-sm font-medium tracking-tight text-[#555555]">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC] p-8 text-center text-[#0D1B2A]">
        <div className="max-w-lg rounded-[1.5rem] border border-[#0D1B2A]/10 bg-white/80 px-10 py-12 shadow-xl shadow-[#0D1B2A]/10 backdrop-blur-md">
          <h2 className="text-2xl font-semibold tracking-tight">Supabase is not configured</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#555555]">
            Set{' '}
            <code className="rounded-md bg-[#E8ECF4] px-1.5 py-0.5 text-sm">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="rounded-md bg-[#E8ECF4] px-1.5 py-0.5 text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{' '}
            <code className="rounded-md bg-[#E8ECF4] px-1.5 py-0.5 text-sm">.env.local</code>, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: typeof LayoutDashboard }) => {
    const active = pathname === href;
    return (
      <Link
        data-admin-nav-link
        href={href}
        className={cn(
          'group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium tracking-tight transition',
          active
            ? 'bg-white/12 text-white shadow-inner shadow-black/20 ring-1 ring-[#D4AF37]/25'
            : 'text-white/75 hover:bg-white/8 hover:text-white',
        )}
      >
        <Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-[#D4AF37]' : 'text-white/55 group-hover:text-white')} />
        <span>{label}</span>
        {active ? <span className="ml-auto h-1 w-6 rounded-full bg-[#D4AF37]" /> : null}
      </Link>
    );
  };

  return (
    <div ref={shellRef} className="flex min-h-screen bg-[#FAFBFC] text-[#0D1B2A]">
      <aside
        data-admin-sidebar
        className="relative hidden w-[17.5rem] shrink-0 flex-col border-r border-white/10 bg-[#0D1B2A] text-white shadow-[16px_0_60px_-38px_rgba(13,27,42,0.65)] lg:flex"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.5]" style={{
          backgroundImage:
            'radial-gradient(800px circle at 20% -20%, rgba(212,175,55,0.28), transparent 45%), radial-gradient(560px circle at 120% 100%, rgba(255,255,255,0.08), transparent 40%)',
        }} />
        <div className="relative flex flex-1 flex-col">
          <div className="flex h-[4.75rem] items-center gap-3 border-b border-white/10 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]/30">
              <span className="text-sm font-bold tracking-tighter text-[#D4AF37]">VS</span>
            </div>
            <div>
              <Link href="/" className="text-lg font-semibold tracking-tight text-white hover:text-[#D4AF37]">
                VISILY
              </Link>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">Studio admin</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-6">
            <NavLink href="/admin" icon={LayoutDashboard} label="Dashboard" />
            <NavLink href="/admin/widgets" icon={LayoutGrid} label="Widgets" />
            <NavLink href="/admin/about" icon={FileText} label="About" />
            <NavLink href="/admin/services" icon={Briefcase} label="Services" />
            <NavLink href="/admin/projects" icon={LayoutGrid} label="Projects" />
            <NavLink href="/admin/analytics" icon={BarChart3} label="Analytics" />
            <NavLink href="/admin/messages" icon={MessageSquare} label="Messages" />
            <NavLink href="/admin/settings" icon={Settings} label="Settings" />
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/85 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-100"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <div data-admin-main className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header
          data-admin-topbar
          className="sticky top-0 z-30 flex min-h-[4.75rem] items-center justify-between gap-4 border-b border-[#0D1B2A]/[0.08] bg-[#FAFBFC]/85 px-6 py-3 backdrop-blur-xl"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#555555]">Overview</p>
            <p className="mt-1 text-sm font-semibold text-[#0D1B2A]">
              Welcome back, <span className="font-medium text-[#555555]">{user.email?.split('@')[0]}</span>
            </p>
          </div>
          <Link href="/" className="rounded-full border border-[#0D1B2A]/12 bg-white/70 px-4 py-2 text-[13px] font-medium text-[#0D1B2A] transition hover:border-[#D4AF37]/45 hover:bg-white">
            View live site →
          </Link>
        </header>

        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-6 py-8 lg:py-10">
          <div className="lg:hidden">
            <p className="text-xs uppercase tracking-[0.25em] text-[#555555]">Navigate</p>
            <div className="mt-3 flex snap-x gap-3 overflow-auto pb-1">
              {[
                ['/admin', 'Home'],
                ['/admin/widgets', 'Widgets'],
                ['/admin/about', 'About'],
                ['/admin/services', 'Services'],
                ['/admin/projects', 'Projects'],
                ['/admin/analytics', 'Analytics'],
                ['/admin/messages', 'Inbox'],
                ['/admin/settings', 'Settings'],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  data-admin-nav-link
                  className={cn(
                    'snap-start rounded-full border border-[#0D1B2A]/10 bg-white/70 px-4 py-2 text-xs font-semibold text-[#0D1B2A]',
                    pathname === href && 'border-[#D4AF37]/45 bg-white',
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
