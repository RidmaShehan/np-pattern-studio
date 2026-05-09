'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AnalyticsEntry } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import worldMap from '@svg-maps/world';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (fetchError) {
        setError(fetchError.message);
      }

      setAnalytics(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  const aggregateBy = (items: AnalyticsEntry[], selector: (entry: AnalyticsEntry) => string | null, limit: number) => {
    const buckets = items.reduce<Record<string, number>>((acc, item) => {
      const key = selector(item)?.trim() || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(buckets)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  };

  const deviceData = useMemo(() => aggregateBy(analytics, entry => entry.device_model, 8), [analytics]);
  const osData = useMemo(() => aggregateBy(analytics, entry => entry.os, 6), [analytics]);
  const browserData = useMemo(() => aggregateBy(analytics, entry => entry.browser, 6), [analytics]);
  const pageData = useMemo(() => aggregateBy(analytics, entry => entry.page_path, 8), [analytics]);
  const countryData = useMemo(() => aggregateBy(analytics, entry => entry.country, 5), [analytics]);
  const countryCodeData = useMemo(
    () => aggregateBy(analytics, entry => entry.country, 300).filter(item => /^[A-Z]{2}$/.test(item.name.toUpperCase())),
    [analytics]
  );

  const COLORS = ['#000000', '#444444', '#777777', '#aaaaaa', '#cccccc'];
  const totalVisits = analytics.length;
  const uniqueIPs = new Set(analytics.map(item => item.ip_address).filter(Boolean)).size;
  const topPage = pageData[0]?.name || '—';
  const topBrowser = browserData[0]?.name || '—';

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500">Loading analytics...</div>;
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-red-700">Failed to load analytics: {error}</div>;
  }

  return (
    <div>
      <div className="mb-10">
        <div className="text-xs tracking-[3px] text-zinc-500 mb-1">INSIGHTS</div>
        <h1 className="text-4xl tracking-tight font-semibold">Analytics</h1>
        <p className="text-zinc-500 mt-2">Last {analytics.length} visits • Updated from live tracking data</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="TOTAL VISITS" value={String(totalVisits)} />
        <KpiCard label="UNIQUE VISITORS (IP)" value={String(uniqueIPs)} />
        <KpiCard label="TOP PAGE" value={topPage} />
        <KpiCard label="TOP BROWSER" value={topBrowser} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Top Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full min-w-0">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                  <BarChart data={deviceData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={58} />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#f4f4f5' }} />
                    <Bar dataKey="value" fill="#111" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-lg bg-slate-50" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Operating Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full min-w-0 flex items-center justify-center">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                  <PieChart>
                    <Pie data={osData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={108} label>
                      {osData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full rounded-lg bg-slate-50" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pageData.map(page => (
              <div key={page.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-sm text-slate-700">{page.name || '/'}</span>
                <Badge className="bg-slate-100 text-slate-700">{page.value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Browser & Country Mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase mb-2">Browsers</p>
              <div className="space-y-2">
                {browserData.map(item => (
                  <RowMetric key={item.name} name={item.name} value={item.value} total={totalVisits} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase mb-2">Countries</p>
              <div className="space-y-2">
                {countryData.map(item => (
                  <RowMetric key={item.name} name={item.name} value={item.value} total={totalVisits} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Visitor World Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <svg viewBox={worldMap.viewBox} className="h-[360px] w-full">
                {worldMap.locations.map((location: { id: string; path: string }) => {
                  const countryCode = location.id.toUpperCase();
                  const value = countryCodeData.find(item => item.name.toUpperCase() === countryCode)?.value || 0;
                  const opacity = value === 0 ? 0.15 : Math.min(0.2 + value / Math.max(totalVisits, 1), 1);

                  return (
                    <path
                      key={location.id}
                      d={location.path}
                      fill={value > 0 ? '#0f172a' : '#cbd5e1'}
                      fillOpacity={opacity}
                      stroke="#f8fafc"
                      strokeWidth={0.5}
                    />
                  );
                })}
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase mb-2">Top countries</p>
              <div className="space-y-2">
                {countryData.length ? (
                  countryData.map(item => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                      <span className="text-sm text-slate-700">{item.name}</span>
                      <Badge className="bg-slate-100 text-slate-700">{item.value}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No country data yet.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[520px]">
            <table className="w-full text-sm">
              <thead className="text-left border-b text-xs text-zinc-500">
                <tr>
                  <th className="py-4">Time</th>
                  <th>IP</th>
                  <th>Device</th>
                  <th>OS</th>
                  <th>Browser</th>
                  <th>Country</th>
                  <th>Page</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {analytics.slice(0, 40).map(a => (
                  <tr key={a.id}>
                    <td className="py-4 text-xs text-zinc-400 whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
                    <td className="font-mono text-xs">{a.ip_address || '—'}</td>
                    <td>{a.device_model || 'Unknown'}</td>
                    <td>{a.os || 'Unknown'}</td>
                    <td>{a.browser || 'Unknown'}</td>
                    <td>{a.country || 'Unknown'}</td>
                    <td className="text-xs text-zinc-500">{a.page_path || '/'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-xs text-zinc-500">{label}</div>
        <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

function RowMetric({ name, value, total }: { name: string; value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700">{name}</span>
        <span className="text-slate-500">{value} ({percent}%)</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
