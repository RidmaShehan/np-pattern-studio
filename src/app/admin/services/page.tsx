'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ServiceItem, Widget } from '@/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

const DEFAULT_SERVICE_ITEMS: ServiceItem[] = [
  { id: 'default-1', title: 'Pattern Development', text: 'Technical pattern drafting with production-ready precision for high-end apparel.', active: true },
  { id: 'default-2', title: 'Sizing & Grading', text: 'Grade-rule systems that preserve silhouette and fit consistency across all sizes.', active: true },
  { id: 'default-3', title: 'Tech Pack Design', text: 'Comprehensive technical packs with callouts, specs, and construction details.', active: true },
  { id: 'default-4', title: 'Sample Creation', text: 'Prototype support for premium fabrics and structured garments from first pass.', active: true },
  { id: 'default-5', title: 'Marker Making', text: 'Fabric-efficient marker planning that optimizes layout and reduces waste.', active: true },
  { id: 'default-6', title: 'Bulk Production Support', text: 'On-call development support to de-risk quality and fit during manufacturing.', active: true },
];

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeImageUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  return url.trim();
}

export default function AdminServicesPage() {
  const supabase = createClient();

  const [widget, setWidget] = useState<Widget | null>(null);
  const [title, setTitle] = useState('Technical precision for every stitch');
  const [subtitle, setSubtitle] = useState('OUR SERVICES');
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editor, setEditor] = useState<ServiceItem>({ title: '', text: '', active: true, image_url: '' });

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('widgets')
        .select('*')
        .eq('type', 'services')
        .order('order', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        toast.error('Failed to load services');
        setLoading(false);
        return;
      }

      if (!data) {
        // Populate with currently visible default website services so user can edit immediately.
        setItems(DEFAULT_SERVICE_ITEMS.map(item => ({ ...item, id: createId() })));
        setLoading(false);
        return;
      }

      const content = (data.content as Record<string, unknown>) || {};
      const loadedItems = Array.isArray(content.items)
        ? (content.items as ServiceItem[]).map(item => ({
            ...item,
            id: item.id || createId(),
            active: item.active !== false,
            image_url: normalizeImageUrl(item.image_url),
          }))
        : DEFAULT_SERVICE_ITEMS.map(item => ({ ...item, id: createId() }));

      setWidget(data as Widget);
      setTitle(typeof content.title === 'string' ? content.title : 'Technical precision for every stitch');
      setSubtitle(typeof content.subtitle === 'string' ? content.subtitle : 'OUR SERVICES');
      setItems(loadedItems);
      setLoading(false);
    };

    load();
  }, [supabase]);

  const ensureWidget = async () => {
    if (widget) return widget;
    const { data, error } = await supabase
      .from('widgets')
      .insert({
        title: 'Services Section',
        type: 'services',
        visible: true,
        order: 2,
        content: { title, subtitle, items: [] },
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error('Could not create services widget');
    }

    const created = data as Widget;
    setWidget(created);
    return created;
  };

  const serializeItems = (nextItems: ServiceItem[]) =>
    nextItems.map(item => ({
      id: item.id || createId(),
      title: item.title,
      text: item.text,
      active: item.active !== false,
      image_url: normalizeImageUrl(item.image_url),
    }));

  const persist = async (nextItems: ServiceItem[], nextTitle = title, nextSubtitle = subtitle) => {
    setSaving(true);
    try {
      const existing = await ensureWidget();
      const payload = {
        title: existing.title || 'Services Section',
        visible: existing.visible,
        content: {
          title: nextTitle,
          subtitle: nextSubtitle,
          items: serializeItems(nextItems),
        },
      };

      const { error } = await supabase.from('widgets').update(payload).eq('id', existing.id);
      if (error) throw error;
      toast.success('Services updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save services');
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setEditor({ title: '', text: '', active: true, image_url: '' });
    setShowEditor(true);
  };

  const openEdit = (item: ServiceItem) => {
    setEditingId(item.id || null);
    setEditor({
      ...item,
      image_url: normalizeImageUrl(item.image_url),
      active: item.active !== false,
    });
    setShowEditor(true);
  };

  const saveItem = async () => {
    if (!editor.title.trim() || !editor.text.trim()) {
      toast.error('Title and description are required');
      return;
    }

    const nextItems = editingId
      ? items.map(item => (item.id === editingId ? { ...editor, id: editingId } : item))
      : [...items, { ...editor, id: createId() }];

    setItems(nextItems);
    setShowEditor(false);
    await persist(nextItems);
  };

  const deleteItem = async (id?: string) => {
    if (!id) return;
    const nextItems = items.filter(item => item.id !== id);
    setItems(nextItems);
    await persist(nextItems);
  };

  const toggleActive = async (id?: string) => {
    if (!id) return;
    const nextItems = items.map(item => (item.id === id ? { ...item, active: item.active === false } : item));
    setItems(nextItems);
    await persist(nextItems);
  };

  const activeCount = useMemo(() => items.filter(item => item.active !== false).length, [items]);
  const editorPreviewSrc = normalizeImageUrl(editor.image_url);

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[3px] text-zinc-500 mb-1">CONTENT</p>
          <h1 className="text-4xl tracking-tight font-semibold">Services</h1>
          <p className="mt-2 text-sm text-zinc-500">{activeCount} active of {items.length} total services</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Add Service</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Heading</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Subtitle</Label>
            <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} />
          </div>
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <Button onClick={() => persist(items, title, subtitle)} disabled={saving}>Save Heading</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">No services yet. Add your first service item.</p>
          ) : (
            items.map(item => {
              const img = normalizeImageUrl(item.image_url);
              return (
              <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin preview of CMS URL
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[10px] text-slate-400 text-center px-1">
                          Sparkles icon
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-slate-900">{item.title}</h3>
                      <Badge className={item.active === false ? 'bg-zinc-100 text-zinc-600' : 'bg-emerald-100 text-emerald-700'}>
                        {item.active === false ? 'Inactive' : 'Active'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{item.text}</p>
                    {img ? (
                      <p className="mt-2 truncate text-xs text-slate-400" title={img}>
                        {img}
                      </p>
                    ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => toggleActive(item.id)}
                      title="Toggle active"
                    >
                      {item.active === false ? 'Activate' : 'Deactivate'}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => openEdit(item)}
                      title="Edit service"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="h-8 px-3 text-xs"
                      onClick={() => deleteItem(item.id)}
                      title="Delete service"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
            })
          )}
        </CardContent>
      </Card>

      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/60 p-6" onClick={() => setShowEditor(false)}>
          <div className="mx-auto mt-6 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold">{editingId ? 'Edit Service' : 'Add Service'}</h3>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Service title</Label>
                <Input value={editor.title} onChange={e => setEditor({ ...editor, title: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={editor.text} onChange={e => setEditor({ ...editor, text: e.target.value })} rows={5} />
              </div>
              <div>
                <Label>Icon image URL (optional)</Label>
                <Input
                  value={editor.image_url ?? ''}
                  placeholder="https://…"
                  onChange={e => setEditor({ ...editor, image_url: e.target.value })}
                />
                <p className="mt-1.5 text-xs text-zinc-500">
                  Shown instead of the default sparkles icon on service cards. Use a direct JPEG, PNG, or WebP link (square images look best).
                </p>
              </div>
              {editorPreviewSrc ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <p className="border-b border-slate-200 bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Preview
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                  <div className="flex justify-center p-4">
                    <img src={editorPreviewSrc} alt="" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[#D4AF37]/20" />
                  </div>
                </div>
              ) : null}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editor.active !== false}
                  onChange={e => setEditor({ ...editor, active: e.target.checked })}
                />
                Active on website
              </label>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditor(false)}>Cancel</Button>
                <Button className="flex-1" onClick={saveItem}>Save Service</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
