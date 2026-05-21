import Link from 'next/link';
import { getAllStatusPages } from '@/lib/db';
import { overallStatus, STATUS_COLORS, STATUS_LABELS } from '@/lib/status';
import { RiCheckboxCircleFill, RiArrowRightLine } from 'react-icons/ri';

export default async function StatusHomePage() {
  const pages = await getAllStatusPages();

  return (
    <div className="container-app py-10 space-y-8 max-w-3xl">
      <div>
        <div className="text-xs text-[var(--color-text-muted)]"><span className="text-[var(--color-neon-green)]">$</span> curl status.dev/all</div>
        <h1 className="text-3xl font-bold mt-2">DevStatus<span className="caret" /></h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Public status pages for developer projects. Real-time service health at a glance.</p>
      </div>

      {/* Featured status pages */}
      {pages.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-widest">// public pages</div>
          {pages.map(page => {
            const overall = overallStatus(page.services);
            const color = STATUS_COLORS[overall];
            const operational = page.services.filter(s => s.status === 'operational').length;
            return (
              <Link key={page.username} href={`/${page.username}`}
                className="term-card block hover:scale-[1.005] transition-all"
                style={{ boxShadow: `0 0 0 1px ${color}20` }}>
                <div className="term-card-header" style={{ color }}>
                  <span>@{page.username} — {page.display_name}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
                    {STATUS_LABELS[overall]}
                  </span>
                </div>
                <div className="term-card-body flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                    <span>{page.services.length} services</span>
                    <span style={{ color: 'var(--color-neon-green)' }}>{operational} operational</span>
                  </div>
                  <RiArrowRightLine size={14} className="text-[var(--color-text-dim)]" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* CTA to create */}
      <div className="term-card" style={{ boxShadow: '0 0 32px rgba(255,140,66,0.15)' }}>
        <div className="term-card-header" style={{ color: 'var(--color-neon-orange)' }}>
          <span>$ devstatus init</span>
        </div>
        <div className="term-card-body space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">Create your own public status page. Add your services, track incidents, and share uptime with users.</p>
          <div className="space-y-2">
            {[
              'Monitor any number of services',
              'Post incident updates in real-time',
              'Share a public URL — no login required for viewers',
            ].map(item => (
              <div key={item} className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
                <RiCheckboxCircleFill size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--color-neon-green)' }} />
                {item}
              </div>
            ))}
          </div>
          <Link href="/manage"
            className="inline-block px-4 py-2 text-sm font-semibold rounded border border-[var(--color-neon-orange)] text-[var(--color-neon-orange)] hover:bg-[rgba(255,140,66,0.1)] transition-colors">
            $ manage my page →
          </Link>
        </div>
      </div>
    </div>
  );
}
