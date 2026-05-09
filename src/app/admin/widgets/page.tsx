'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Widget } from '@/types';
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Widget | null>(null);
  const [form, setForm] = useState({ title: '', type: 'hero', content: '{}', visible: true });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const supabase = createClient();
  const sectionTemplates: Record<string, string> = {
    hero: JSON.stringify(
      {
        badge: 'SRI LANKA - 35 YEARS OF MASTERY',
        title: 'The art of precision pattern making',
        description: 'Masterful apparel solutions tailored to your vision.',
        primaryCta: 'Get a free quote',
        secondaryCta: 'View our work',
        assistantNote: 'CAD workflow optimized',
      },
      null,
      2
    ),
    services: JSON.stringify(
      {
        title: 'Technical precision for every stitch',
        subtitle: 'OUR SERVICES',
        items: [
          {
            title: 'Pattern Development',
            text: 'Technical pattern drafting with production-ready precision.',
            image_url: '',
          },
        ],
      },
      null,
      2
    ),
    portfolio: JSON.stringify(
      {
        title: 'Our Projects',
        subtitle: 'Explore our gallery of technical triumphs.',
        items: [
          {
            name: 'The Signature Tailored Blazer',
            desc: 'Architecture-inspired blazer with precision-engineered balance lines.',
            image_url: '',
          },
        ],
      },
      null,
      2
    ),
    about: JSON.stringify(
      {
        sectionEyebrow: 'About us',
        title: 'Masters of the craft, built over decades',
        heritageLabel: 'Our heritage',
        heritageTitle: 'Three and a half decades of unwavering excellence.',
        heritageText: 'Founded in 1988 in Sri Lanka’s apparel heartland...',
        image_url: '',
      },
      null,
      2
    ),
    testimonials: JSON.stringify(
      {
        title: "Trusted by the world's most discerning fashion houses.",
        subtitle: 'TESTIMONIALS',
        items: [{ quote: 'Their precision is unmatched.', name: 'Client Name', role: 'Founder, Brand' }],
      },
      null,
      2
    ),
    contact: JSON.stringify(
      {
        title: "Let's craft your next masterpiece together",
        subtitle: 'GET IN TOUCH',
      },
      null,
      2
    ),
    custom: '{}',
  };

  const loadWidgets = async () => {
    const { data } = await supabase.from('widgets').select('*').order('order');
    setWidgets(data || []);
  };

  useEffect(() => {
    loadWidgets();
  }, []);

  const saveWidget = async () => {
    try {
      const payload = {
        ...form,
        content: JSON.parse(form.content || '{}'),
      };

      if (editing) {
        await supabase.from('widgets').update(payload).eq('id', editing.id);
        toast.success('Widget updated');
      } else {
        const maxOrder = Math.max(0, ...widgets.map(w => w.order));
        await supabase.from('widgets').insert({ ...payload, order: maxOrder + 1 });
        toast.success('Widget created');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ title: '', type: 'hero', content: '{}', visible: true });
      setUploadedImage(null);
      loadWidgets();
    } catch (e) {
      toast.error('Invalid JSON in content field');
    }
  };

  const toggleVisibility = async (widget: Widget) => {
    await supabase.from('widgets').update({ visible: !widget.visible }).eq('id', widget.id);
    loadWidgets();
  };

  const deleteWidget = async (id: string) => {
    if (!confirm('Delete this widget?')) return;
    await supabase.from('widgets').delete().eq('id', id);
    loadWidgets();
    toast.success('Widget deleted');
  };

  const move = async (widget: Widget, direction: 'up' | 'down') => {
    const index = widgets.findIndex(w => w.id === widget.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= widgets.length) return;

    const swapWidget = widgets[swapIndex];

    await supabase.from('widgets').update({ order: swapWidget.order }).eq('id', widget.id);
    await supabase.from('widgets').update({ order: widget.order }).eq('id', swapWidget.id);

    loadWidgets();
  };

  const openEdit = (widget: Widget) => {
    setEditing(widget);
    setForm({
      title: widget.title,
      type: widget.type,
      content: JSON.stringify(widget.content, null, 2),
      visible: widget.visible,
    });
    setUploadedImage(null);
    setShowModal(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', type: 'hero', content: '{}', visible: true });
    setUploadedImage(null);
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const useImageInContent = () => {
    if (!uploadedImage) return;
    try {
      const current = JSON.parse(form.content || '{}');
      const updated = { ...current, image: uploadedImage };
      setForm({ ...form, content: JSON.stringify(updated, null, 2) });
      setUploadedImage(null);
      toast.success('Base64 image added to content JSON');
    } catch {
      toast.error('Could not update JSON – check for syntax errors');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <div className="text-xs tracking-[3px] text-zinc-500 mb-1">CONTENT</div>
          <h1 className="text-4xl tracking-tight font-semibold">Widgets</h1>
        </div>
        <Button onClick={openNew} className="h-10">
          <Plus size={16} /> New Widget
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Homepage and section content</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-zinc-500">
            <tr>
              <th className="p-6 font-normal w-12">#</th>
              <th className="p-6 font-normal">Title</th>
              <th className="p-6 font-normal">Type</th>
              <th className="p-6 font-normal">Status</th>
              <th className="p-6 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {widgets.map((w, index) => (
              <tr key={w.id} className="hover:bg-zinc-50">
                <td className="p-6 text-xs text-zinc-400 tabular-nums">{index + 1}</td>
                <td className="p-6 font-medium">{w.title}</td>
                <td className="p-6 capitalize text-zinc-500">{w.type}</td>
                <td className="p-6">
                  <Badge className={w.visible ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}>
                    {w.visible ? 'Visible' : 'Hidden'}
                  </Badge>
                </td>
                <td className="p-6 text-right space-x-2">
                  <Button variant="ghost" onClick={() => move(w, 'up')} className="h-8 w-8 p-0" title="Move up"><ArrowUp size={15} /></Button>
                  <Button variant="ghost" onClick={() => move(w, 'down')} className="h-8 w-8 p-0" title="Move down"><ArrowDown size={15} /></Button>
                  <Button variant="ghost" onClick={() => toggleVisibility(w)} className="h-8 w-8 p-0" title="Toggle visibility">{w.visible ? <Eye size={15} /> : <EyeOff size={15} />}</Button>
                  <Button variant="ghost" onClick={() => openEdit(w)} className="h-8 w-8 p-0"><Edit2 size={15} /></Button>
                  <Button variant="ghost" onClick={() => deleteWidget(w.id)} className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"><Trash2 size={15} /></Button>
                </td>
              </tr>
            ))}
            {widgets.length === 0 && (
              <tr><td colSpan={5} className="p-12 text-center text-zinc-400">No widgets yet. Create your first one.</td></tr>
            )}
          </tbody>
        </table>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-semibold tracking-tight mb-8">{editing ? 'Edit Widget' : 'New Widget'}</h3>

            <div className="space-y-5">
              <div>
                <Label>Widget Title</Label>
                <Input
                  placeholder="Widget title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Widget Type</Label>
                <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm capitalize"
                value={form.type} 
                onChange={e => setForm({ ...form, type: e.target.value as any })}
              >
                {['hero', 'services', 'portfolio', 'about', 'testimonials', 'contact', 'custom'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
                </select>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="mb-0">Content JSON</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setForm({ ...form, content: sectionTemplates[form.type] ?? '{}' })}
                  >
                    Use template
                  </Button>
                </div>
                <Textarea
                className="font-mono text-sm h-60 resize-y" 
                placeholder='{"heading": "...", "description": "...", "image": "data:image/..."}' 
                value={form.content} 
                onChange={e => setForm({ ...form, content: e.target.value })} 
              />
              </div>

              {/* Base64 Image Upload */}
              <div className="border rounded-3xl p-6 bg-zinc-50">
                <div className="text-xs tracking-[2px] text-zinc-500 mb-3">IMAGE → BASE64 (STORED IN DATABASE)</div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-zinc-800" 
                />
                {uploadedImage && (
                  <div className="mt-4 flex gap-4 items-start">
                    <img src={uploadedImage} alt="preview" className="w-24 h-24 object-cover rounded-2xl border" />
                    <div className="flex-1">
                      <Button
                        type="button"
                        onClick={useImageInContent} 
                        className="h-9 bg-emerald-600 hover:bg-emerald-700"
                      >
                        Insert base64 into content JSON
                      </Button>
                      <p className="text-[10px] text-zinc-400 mt-2">The image will be saved as a data URL inside your widget's content. Works in &lt;img src&gt; tags.</p>
                    </div>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input type="checkbox" checked={form.visible} onChange={e => setForm({ ...form, visible: e.target.checked })} /> Visible on site
              </label>
            </div>

            <div className="flex gap-3 mt-10">
              <Button variant="outline" onClick={() => { setShowModal(false); setUploadedImage(null); }} className="flex-1 h-11">Cancel</Button>
              <Button onClick={saveWidget} className="flex-1 h-11">Save Widget</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
