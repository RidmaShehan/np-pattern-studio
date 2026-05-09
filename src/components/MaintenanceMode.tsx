import { cn } from '@/lib/utils';
import { headingLg } from '@/lib/publicStyles';

export default function MaintenanceMode() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFBFC] text-[#0D1B2A]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            'radial-gradient(900px circle at 18% -8%, rgba(99, 123, 255, 0.06), transparent 48%), radial-gradient(720px circle at 96% -4%, rgba(13, 27, 42, 0.06), transparent 44%)',
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-8 text-center">
        <span className="inline-flex rounded-full border border-[#0D1B2A]/10 bg-white/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#555555]">
          Maintenance mode
        </span>
        <h1 className={cn(headingLg, 'mt-8')}>We&apos;ll be back shortly</h1>
        <p className="mt-5 text-lg leading-relaxed text-[#555555]">
          The website is temporarily under maintenance. Please try again soon.
        </p>
      </div>
    </main>
  );
}
