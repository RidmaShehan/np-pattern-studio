# Visily Multi-Screen Website + Admin Panel

Modern, high-performance Next.js website with full-featured Supabase-powered admin panel.

## Features
- **Beautiful responsive UI** with smooth Framer Motion animations
- **Dynamic widgets/sections** editable via admin (add, edit, delete, toggle visibility, reorder)
- **Analytics dashboard**: Track visits with IP, device, OS, browser, time, page
- **Messages inbox**: View contact form submissions
- **Editable social links & contact details**
- **Fixed WhatsApp floating button**
- **Image lazy loading** + optimized for speed (Next.js Image, code splitting)
- **100% SEO friendly**: Proper metadata, headings, alt texts, semantic HTML, sitemap
- **Vercel ready**

## Tech Stack
- Next.js 16 (App Router) + TypeScript + Tailwind
- Supabase (Postgres + Auth + Storage)
- Framer Motion, Sonner, React Hook Form, Zod, Recharts

## Quick Start

1. Clone & install (already done)

2. Set up Supabase
   - Create project at supabase.com
   - Copy `.env.example` to `.env.local`
   - Run the SQL from `supabase-schema.sql` in SQL Editor
   - Enable Email/Password auth provider
   - Create first admin user via Auth > Users (or sign up)

3. Add env vars
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=... (for server-side if needed)
   ```

4. Run dev
   ```bash
   npm run dev
   ```

5. Admin: Go to /admin (login with Supabase user)

## File Architecture (Best Practices)
```
src/
├── app/
│   ├── (public)/          # Public routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── admin/             # Protected admin routes
│   │   ├── layout.tsx
│   │   ├── page.tsx       # Dashboard
│   │   ├── widgets/
│   │   ├── analytics/
│   │   ├── messages/
│   │   └── settings/
│   └── api/               # API routes (analytics logging)
├── components/
│   ├── ui/                # Reusable shadcn-style
│   ├── sections/          # Homepage sections (lazy loaded)
│   ├── admin/             # Admin UI components
│   └── WhatsAppButton.tsx
├── lib/
│   ├── supabase/
│   └── utils.ts
├── types/
└── hooks/
```

## Deployment on Vercel
- Push to GitHub
- Import in Vercel → auto deploys
- Add env vars in Vercel dashboard
- Done (zero config)

## Performance & SEO
- Lazy loaded sections and images
- Server Components by default
- Framer Motion for buttery animations without jank
- Proper ARIA, semantic markup
- Auto-generated metadata

Customize sections based on your Visily design screens. Widgets table allows full control over homepage layout.
