'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ widgets: 0, messages: 0, visits: 0, unread: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const [widgetsRes, messagesRes, analyticsRes, unreadRes] = await Promise.all([
        supabase.from('widgets').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('analytics').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('read', false),
      ]);

      setStats({
        widgets: widgetsRes.count || 0,
        messages: messagesRes.count || 0,
        visits: analyticsRes.count || 0,
        unread: unreadRes.count || 0,
      });
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="mb-10">
        <div className="text-xs tracking-[3px] text-zinc-500 mb-2">OVERVIEW</div>
        <h1 className="text-5xl font-semibold tracking-tighter">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Widgets', value: stats.widgets, href: '/admin/widgets' },
          { label: 'Total Visits', value: stats.visits, href: '/admin/analytics' },
          { label: 'Messages', value: stats.messages, href: '/admin/messages' },
          { label: 'Unread', value: stats.unread, href: '/admin/messages' },
        ].map((stat, i) => (
          <Link key={i} href={stat.href} className="bg-white border rounded-3xl p-8 hover:border-black transition-all group">
            <div className="text-7xl font-semibold tabular-nums tracking-tighter mb-4">{stat.value}</div>
            <div className="flex items-center justify-between text-sm text-zinc-500 group-hover:text-black">
              {stat.label} <ArrowRight size={16} className="group-hover:-translate-x-0.5 transition" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-xs text-zinc-400">
        Tip: Use the Widgets section to control exactly what appears on the homepage.
      </div>
    </div>
  );
}
