'use client';

import { useRef, useState } from 'react';
import { ImageIcon, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

const MAX_DIMENSION = 1400;
const MAX_FILE_MB = 8;
const JPEG_QUALITY = 0.85;

function compressToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width >= height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas unavailable')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.onerror = () => reject(new Error('Could not decode image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

type ImageUploadFieldProps = {
  value: string;
  onChange: (base64: string) => void;
  label?: string;
  hint?: string;
  /** Extra classes applied to the preview <img> wrapper div */
  previewAspect?: string;
};

export default function ImageUploadField({
  value,
  onChange,
  label,
  hint,
  previewAspect = 'max-h-56 w-full',
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_FILE_MB} MB.`);
      return;
    }
    setConverting(true);
    try {
      const base64 = await compressToBase64(file);
      onChange(base64);
    } catch {
      setError('Failed to process image. Please try a different file.');
    } finally {
      setConverting(false);
    }
  };

  const triggerPick = () => inputRef.current?.click();

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className={`${previewAspect} object-cover`} />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button
              type="button"
              onClick={triggerPick}
              disabled={converting}
              className="flex h-8 items-center gap-1.5 rounded-md bg-white/92 px-2.5 text-xs font-medium text-slate-700 shadow ring-1 ring-slate-200 transition hover:bg-white disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {converting ? 'Processing…' : 'Change'}
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Remove image"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-white/92 text-slate-500 shadow ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-500"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerPick}
          disabled={converting}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-sm text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {converting ? (
            <span className="text-xs text-slate-400">Processing image…</span>
          ) : (
            <>
              <ImageIcon className="h-9 w-9 text-slate-300" />
              <span className="font-medium">Click to upload image</span>
              <span className="text-xs text-slate-400">
                JPEG · PNG · WebP · max {MAX_FILE_MB} MB
              </span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
