import Link from 'next/link';
import { getStatusPage } from '@/lib/db';
import { overallStatus, STATUS_COLORS, STATUS_LABELS } from '@/lib/status';
import { RiArrowLeftLine, RiErrorWarningLine, RiTimeLine } from 'react-icons/ri';
import { notFound } from 'next/navigation';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function UserStatusPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const result = await getStatusPage(username);
  if (!result) notFound();

  const { page, incidents } = result;
  const overall = overallStatus(page.services);
  const color = STATUS_COLORS[overall];
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <div className="container-app py-10 space-y-8 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-neon-orange)] transition-colors">
          <RiArrowLeftLine size={13} /> $ ls /status
        </Link>
      </div>

      {/* Overall status */}
      <div className="term-card" style={{ boxShadow: `0 0 32px ${color}30` }}>
        <div className="term-card-header" style={{ color }}>
          <span>@{page.username} — {page.display_name}</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
            {STATUS_LABELS[overall]}
          </span>
        </div>
        <div className="term-card-body">
          <p className="text-sm text-[var(--color-text-muted)]">
            {overall === 'operational'
              ? 'All systems are operational. No issues detected.'
              : 'Some systems are experiencing issues. See below for details.'}
          </p>
        </div>
      </div>

      {/* Active incidents */}
      {activeIncidents.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-widest">// active incidents</div>
          {activeIncidents.map(incident => (
            <div key={incident.id} className="term-card" style={{ borderColor: 'rgba(255,181,71,0.4)' }}>
              <div className="term-card-header" style={{ color: 'var(--color-neon-amber)' }}>
                <span className="flex items-center gap-2"><RiErrorWarningLine size={14} /> {incident.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded border border-[rgba(255,181,71,0.3)]">{incident.status}</span>
              </div>
              <div className="term-card-body space-y-3">
                {incident.updates.map((u: { time: string; message: string }, i: number) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="text-[var(--color-text-dim)] shrink-0 flex items-center gap-1">
                      <RiTimeLine size={11} /> {timeAgo(u.time)}
                    </span>
                    <span className="text-[var(--color-text-muted)]">{u.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Services */}
      <div className="space-y-3">
        <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-widest">// services</div>
        {page.services.length === 0 ? (
          <div className="term-card text-center py-10 text-[var(--color-text-dim)] text-sm">
            No services configured yet.
          </div>
        ) : page.services.map(service => {
          const sc = STATUS_COLORS[service.status];
          return (
            <div key={service.id} className="term-card">
              <div className="flex items-center gap-3 p-4">
                <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: sc, animationPlayState: service.status === 'operational' ? 'paused' : 'running' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--color-text)]">{service.name}</span>
                    <span className="text-xs" style={{ color: sc }}>{STATUS_LABELS[service.status]}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[var(--color-text-muted)]">{service.description}</span>
                    <span className="text-[10px] text-[var(--color-text-dim)]">{service.uptimePct.toFixed(2)}% uptime</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-[var(--color-text-dim)] text-center">
        Last updated: {new Date().toLocaleTimeString()} · Powered by{' '}
        <a href="http://localhost:3007" style={{ color: 'var(--color-neon-orange)' }}>DevStatus</a>
      </div>
    </div>
  );
}
