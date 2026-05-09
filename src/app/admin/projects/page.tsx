'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ProjectItem } from '@/lib/content';
import { Widget } from '@/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

const DEFAULT_PROJECT_ITEMS: ProjectItem[] = [
  { id: 'project-1', name: 'The Signature Tailored Blazer', desc: 'Architecture-inspired blazer with precision-engineered balance lines.', active: true },
  { id: 'project-2', name: 'High-Performance Compression Set', desc: '4-way stretch activewear grading that preserves tension and support.', active: true },
  { id: 'project-3', name: 'Silk Charmouse Evening Gown', desc: 'Bias-cut evening wear with soft drape behavior mapped for consistency.', active: true },
  { id: 'project-4', name: 'Structured Utility Outerwear', desc: 'Reinforced seam architecture for functional, urban outerwear collections.', active: true },
];

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeImageUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  return url.trim();
}

const emptyEditor = (): ProjectItem => ({
  name: '',
  desc: '',
  image_url: '',
  active: true,
});

export default function AdminProjectsPage() {
  const supabase = createClient();

  const [widget, setWidget] = useState<Widget | null>(null);
  const [title, setTitle] = useState('Our Projects');
  const [subtitle, setSubtitle] = useState('Explore our gallery of technical triumphs. From complex high-fashion drapes to precision-engineered activewear.');
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editor, setEditor] = useState<ProjectItem>(emptyEditor());

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('widgets')
        .select('*')
        .eq('type', 'portfolio')
        .order('order', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        toast.error('Failed to load projects');
        setLoading(false);
        return;
      }

      if (!data) {
        setItems(DEFAULT_PROJECT_ITEMS.map(item => ({ ...item, id: createId() })));
        setLoading(false);
        return;
      }

      const content = (data.content as Record<string, unknown>) || {};
      const loadedItems = Array.isArray(content.items)
        ? (content.items as ProjectItem[]).map(item => ({
            ...item,
            id: item.id || createId(),
            active: item.active !== false,
            image_url: normalizeImageUrl(item.image_url),
          }))
        : DEFAULT_PROJECT_ITEMS.map(item => ({ ...item, id: createId() }));

      setWidget(data as Widget);
      setTitle(typeof content.title === 'string' ? content.title : 'Our Projects');
      setSubtitle(
        typeof content.subtitle === 'string'
          ? content.subtitle
          : 'Explore our gallery of technical triumphs. From complex high-fashion drapes to precision-engineered activewear.'
      );
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
        title: 'Projects Section',
        type: 'portfolio',
        visible: true,
        order: 3,
        content: { title, subtitle, items: [] },
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error('Could not create projects widget');
    }

    const created = data as Widget;
    setWidget(created);
    return created;
  };

  const serializeItems = (nextItems: ProjectItem[]) =>
    nextItems.map(item => ({
      id: item.id || createId(),
      name: item.name,
      desc: item.desc,
      image_url: normalizeImageUrl(item.image_url),
      active: item.active !== false,
    }));

  const persist = async (nextItems: ProjectItem[], nextTitle = title, nextSubtitle = subtitle) => {
    setSaving(true);
    try {
      const existing = await ensureWidget();
      const payload = {
        title: existing.title || 'Projects Section',
        visible: existing.visible,
        content: {
          title: nextTitle,
          subtitle: nextSubtitle,
          items: serializeItems(nextItems),
        },
      };

      const { error } = await supabase.from('widgets').update(payload).eq('id', existing.id);
      if (error) throw error;
      toast.success('Projects updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save projects');
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setEditor(emptyEditor());
    setShowEditor(true);
  };

  const openEdit = (item: ProjectItem) => {
    setEditingId(item.id || null);
    setEditor({
      ...item,
      image_url: normalizeImageUrl(item.image_url),
      active: item.active !== false,
    });
    setShowEditor(true);
  };

  const saveItem = async () => {
    if (!editor.name.trim() || !editor.desc.trim()) {
      toast.error('Project name and description are required');
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
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[3px] text-zinc-500 mb-1">CONTENT</p>
          <h1 className="text-4xl tracking-tight font-semibold">Projects</h1>
          <p className="mt-2 text-sm text-zinc-500">{activeCount} active of {items.length} total projects</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Add Project</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Heading</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={3} />
          </div>
          <Button onClick={() => persist(items, title, subtitle)} disabled={saving}>Save Heading</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">No projects yet. Add your first project item.</p>
          ) : (
            items.map(item => {
              const img = normalizeImageUrl(item.image_url);
              return (
                <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[10px] text-slate-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-slate-900">{item.name}</h3>
                          <Badge className={item.active === false ? 'bg-zinc-100 text-zinc-600' : 'bg-emerald-100 text-emerald-700'}>
                            {item.active === false ? 'Inactive' : 'Active'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                        {img ? (
                          <p className="mt-2 truncate text-xs text-slate-400" title={img}>
                            {img}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => toggleActive(item.id)}>
                        {item.active === false ? 'Activate' : 'Deactivate'}
                      </Button>
                      <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                      <Button variant="destructive" className="h-8 px-3 text-xs" onClick={() => deleteItem(item.id)}>
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
            <h3 className="text-xl font-semibold">{editingId ? 'Edit Project' : 'Add Project'}</h3>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Project name</Label>
                <Input value={editor.name} onChange={e => setEditor({ ...editor, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={editor.desc} onChange={e => setEditor({ ...editor, desc: e.target.value })} rows={5} />
              </div>
              <div>
                <Label>Cover image URL (optional)</Label>
                <Input
                  value={editor.image_url ?? ''}
                  placeholder="https://…"
                  onChange={e => setEditor({ ...editor, image_url: e.target.value })}
                />
                <p className="mt-1.5 text-xs text-zinc-500">
                  Paste a direct image link (JPEG, PNG, WebP). You can upload to Supabase Storage, Cloudinary, or any public URL.
                </p>
              </div>
              {editorPreviewSrc ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <p className="border-b border-slate-200 bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Preview
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editorPreviewSrc} alt="" className="max-h-48 w-full object-contain" />
                </div>
              ) : null}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editor.active !== false} onChange={e => setEditor({ ...editor, active: e.target.checked })} />
                Active on website
              </label>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditor(false)}>Cancel</Button>
                <Button className="flex-1" onClick={saveItem}>Save Project</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
