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
  badge: 'SRI LANKA - 35 YEARS OF MASTERY',
  title: 'The art of precision pattern making',
  highlight: 'precision',
  description:
    'Masterful apparel solutions tailored to your vision. We blend traditional craftsmanship with modern CAD technology.',
  primaryCta: 'Get a free quote',
  secondaryCta: 'View our work',
  assistantNote: 'CAD workflow optimized',
  image_url: '',
};

function pick(obj: Record<string, unknown>, key: string, fallback: string) {
  const v = obj[key];
  return typeof v === 'string' && v.trim().length > 0 ? v : fallback;
}

function pickOpt(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return typeof v === 'string' ? v : '';
}

export default function AdminHeroPage() {
  const supabase = useMemo(() => createClient(), []);

  const [widget, setWidget] = useState<Widget | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [badge, setBadge] = useState(DEFAULT.badge);
  const [title, setTitle] = useState(DEFAULT.title);
  const [highlight, setHighlight] = useState(DEFAULT.highlight);
  const [description, setDescription] = useState(DEFAULT.description);
  const [primaryCta, setPrimaryCta] = useState(DEFAULT.primaryCta);
  const [secondaryCta, setSecondaryCta] = useState(DEFAULT.secondaryCta);
  const [assistantNote, setAssistantNote] = useState(DEFAULT.assistantNote);
  const [imageUrl, setImageUrl] = useState(DEFAULT.image_url);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('widgets')
        .select('*')
        .eq('type', 'hero')
        .order('order', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        toast.error('Failed to load hero section');
        setLoading(false);
        return;
      }

      if (data) {
        const c = (data.content as Record<string, unknown>) || {};
        setWidget(data as Widget);
        setBadge(pick(c, 'badge', DEFAULT.badge));
        setTitle(pick(c, 'title', DEFAULT.title));
        setHighlight(pick(c, 'highlight', DEFAULT.highlight));
        setDescription(pick(c, 'description', DEFAULT.description));
        setPrimaryCta(pick(c, 'primaryCta', DEFAULT.primaryCta));
        setSecondaryCta(pick(c, 'secondaryCta', DEFAULT.secondaryCta));
        setAssistantNote(pick(c, 'assistantNote', DEFAULT.assistantNote));
        setImageUrl(pickOpt(c, 'image_url'));
      }

      setLoading(false);
    };
    load();
  }, [supabase]);

  const contentPayload = () => ({
    badge: badge.trim() || DEFAULT.badge,
    title: title.trim() || DEFAULT.title,
    highlight: highlight.trim() || DEFAULT.highlight,
    description: description.trim() || DEFAULT.description,
    primaryCta: primaryCta.trim() || DEFAULT.primaryCta,
    secondaryCta: secondaryCta.trim() || DEFAULT.secondaryCta,
    assistantNote: assistantNote.trim() || DEFAULT.assistantNote,
    image_url: imageUrl,
  });

  const ensureWidget = async () => {
    if (widget) return widget;
    const { data, error } = await supabase
      .from('widgets')
      .insert({
        title: 'Hero Section',
        type: 'hero',
        visible: true,
        order: 0,
        content: contentPayload(),
      })
      .select('*')
      .single();

    if (error || !data) throw new Error('Could not create hero widget');
    const w = data as Widget;
    setWidget(w);
    return w;
  };

  const save = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setSaving(true);
    try {
      const existing = await ensureWidget();
      const { error } = await supabase
        .from('widgets')
        .update({
          title: existing.title || 'Hero Section',
          visible: existing.visible,
          content: contentPayload(),
        })
        .eq('id', existing.id);

      if (error) throw error;
      toast.success('Hero section saved');
    } catch {
      toast.error('Failed to save hero section');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
        Loading hero section…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-xs tracking-[3px] text-zinc-500">CONTENT</p>
        <h1 className="text-4xl font-semibold tracking-tight">Hero section</h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-500">
          Controls the full-width banner at the top of the homepage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badge &amp; headline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Badge text</Label>
            <Input value={badge} onChange={e => setBadge(e.target.value)} placeholder={DEFAULT.badge} />
            <p className="mt-1.5 text-xs text-zinc-500">
              Small pill above the main headline (e.g. "SRI LANKA — 35 YEARS OF MASTERY").
            </p>
          </div>
          <div>
            <Label>Main headline</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Highlighted word</Label>
            <Input
              value={highlight}
              onChange={e => setHighlight(e.target.value)}
              placeholder="precision"
            />
            <p className="mt-1.5 text-xs text-zinc-500">
              One word from the headline that receives a gold underline / accent style.
            </p>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Call-to-action buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Primary CTA label</Label>
            <Input value={primaryCta} onChange={e => setPrimaryCta(e.target.value)} placeholder={DEFAULT.primaryCta} />
          </div>
          <div>
            <Label>Secondary CTA label</Label>
            <Input value={secondaryCta} onChange={e => setSecondaryCta(e.target.value)} placeholder={DEFAULT.secondaryCta} />
          </div>
          <div>
            <Label>Assistant note</Label>
            <Input
              value={assistantNote}
              onChange={e => setAssistantNote(e.target.value)}
              placeholder={DEFAULT.assistantNote}
            />
            <p className="mt-1.5 text-xs text-zinc-500">
              Small text shown inside the gold info box below the buttons.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hero image</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploadField
            value={imageUrl}
            onChange={setImageUrl}
            hint="Shown in the right panel of the hero card. Image is compressed and stored directly in the database."
            previewAspect="aspect-[4/5] w-full max-h-80 object-cover"
          />
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="min-h-11 min-w-[180px]">
        {saving ? 'Saving…' : 'Save Hero section'}
      </Button>
    </div>
  );
}
