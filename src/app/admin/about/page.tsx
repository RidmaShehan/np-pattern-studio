'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Widget } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUploadField from '@/components/admin/ImageUploadField';

const DEFAULT = {
  sectionEyebrow: 'About us',
  title: 'Masters of the craft, built over decades',
  heritageLabel: 'Our heritage',
  heritageTitle: 'Three and a half decades of unwavering excellence.',
  heritageText:
    "Founded in 1988 in Sri Lanka's apparel heartland, Pattern.lk began as a boutique atelier. Today we merge legacy craftsmanship with CAD-driven systems for global brands.",
  image_url: '',
};

function pickString(obj: Record<string, unknown>, key: string, fallback: string) {
  const v = obj[key];
  return typeof v === 'string' && v.trim().length > 0 ? v : fallback;
}

function trimUrl(raw: unknown) {
  return typeof raw === 'string' ? raw.trim() : '';
}

export default function AdminAboutPage() {
  const supabase = useMemo(() => createClient(), []);

  const [widget, setWidget] = useState<Widget | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sectionEyebrow, setSectionEyebrow] = useState(DEFAULT.sectionEyebrow);
  const [title, setTitle] = useState(DEFAULT.title);
  const [heritageLabel, setHeritageLabel] = useState(DEFAULT.heritageLabel);
  const [heritageTitle, setHeritageTitle] = useState(DEFAULT.heritageTitle);
  const [heritageText, setHeritageText] = useState(DEFAULT.heritageText);
  const [imageUrl, setImageUrl] = useState(DEFAULT.image_url);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('widgets')
        .select('*')
        .eq('type', 'about')
        .order('order', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        toast.error('Failed to load about section');
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      const c = (data.content as Record<string, unknown>) || {};
      setWidget(data as Widget);
      setSectionEyebrow(pickString(c, 'sectionEyebrow', DEFAULT.sectionEyebrow));
      setTitle(pickString(c, 'title', DEFAULT.title));
      setHeritageLabel(pickString(c, 'heritageLabel', DEFAULT.heritageLabel));
      setHeritageTitle(pickString(c, 'heritageTitle', DEFAULT.heritageTitle));
      setHeritageText(pickString(c, 'heritageText', DEFAULT.heritageText));
      setImageUrl(trimUrl(c.image_url));
      setLoading(false);
    };
    load();
  }, [supabase]);

  const contentPayload = (): Record<string, string> => ({
    sectionEyebrow: sectionEyebrow.trim() || DEFAULT.sectionEyebrow,
    title: title.trim(),
    heritageLabel: heritageLabel.trim() || DEFAULT.heritageLabel,
    heritageTitle: heritageTitle.trim(),
    heritageText: heritageText.trim(),
    image_url: imageUrl.trim(),
  });

  const ensureWidget = async () => {
    if (widget) return widget;

    const { data, error } = await supabase
      .from('widgets')
      .insert({
        title: 'About Section',
        type: 'about',
        visible: true,
        order: 2,
        content: contentPayload(),
      })
      .select('*')
      .single();

    if (error || !data) throw new Error('Could not create about widget');
    const w = data as Widget;
    setWidget(w);
    return w;
  };

  const save = async () => {
    if (!title.trim() || !heritageTitle.trim() || !heritageText.trim()) {
      toast.error('Main title, heritage title, and heritage text are required');
      return;
    }
    setSaving(true);
    try {
      const existing = await ensureWidget();
      const body = contentPayload();

      const { error } = await supabase
        .from('widgets')
        .update({
          title: existing.title || 'About Section',
          visible: existing.visible,
          content: body,
        })
        .eq('id', existing.id);

      if (error) throw error;
      toast.success('About section saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">Loading about section…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[3px] text-zinc-500 mb-1">CONTENT</p>
        <h1 className="text-4xl tracking-tight font-semibold">About section</h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-500">
          Powers the homepage “About” block and the standalone <strong className="font-medium text-zinc-700">/about</strong> page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Headline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Section eyebrow</Label>
            <Input
              value={sectionEyebrow}
              onChange={e => setSectionEyebrow(e.target.value)}
              placeholder={DEFAULT.sectionEyebrow}
            />
            <p className="mt-1.5 text-xs text-zinc-500">Small caps line above the main title.</p>
          </div>
          <div>
            <Label>Main title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Heritage block</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Pill label</Label>
            <Input value={heritageLabel} onChange={e => setHeritageLabel(e.target.value)} placeholder={DEFAULT.heritageLabel} />
          </div>
          <div>
            <Label>Heritage title</Label>
            <Input value={heritageTitle} onChange={e => setHeritageTitle(e.target.value)} />
          </div>
          <div>
            <Label>Heritage text</Label>
            <Textarea value={heritageText} onChange={e => setHeritageText(e.target.value)} rows={6} />
          </div>
          <ImageUploadField
            label="Side image (optional)"
            value={imageUrl}
            onChange={setImageUrl}
            hint="Shown beside the heritage text. Image is stored directly in the database."
            previewAspect="max-h-56 w-full"
          />
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="min-h-11 min-w-[180px]">
        {saving ? 'Saving…' : 'Save About section'}
      </Button>
    </div>
  );
}
