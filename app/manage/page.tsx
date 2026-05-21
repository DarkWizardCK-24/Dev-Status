'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { STATUS_COLORS, STATUS_LABELS, type StatusLevel, type Service } from '@/lib/status';
import {
  getMyStatusPage, createStatusPage, updateServices,
  createIncident, updateIncident, deleteIncident,
  type StatusPage, type Incident,
} from '@/lib/db';
import { RiArrowLeftLine, RiAddLine, RiDeleteBinLine, RiExternalLinkLine, RiErrorWarningLine } from 'react-icons/ri';

const STATUSES: StatusLevel[] = ['operational', 'degraded', 'partial', 'outage', 'maintenance'];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

export default function ManagePage() {
  const [page, setPage] = useState<StatusPage | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [username, setUsername] = useState('myproject');
  const [displayName, setDisplayName] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showIncident, setShowIncident] = useState(false);
  const [svcForm, setSvcForm] = useState({ name: '', description: '', status: 'operational' as StatusLevel });
  const [incForm, setIncForm] = useState({ title: '', severity: 'minor' as Incident['severity'], message: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const result = await getMyStatusPage();
    if (result) {
      setPage(result.page);
      setUsername(result.page.username);
      setDisplayName(result.page.display_name);
      setServices(result.page.services);
      setIncidents(result.incidents);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function addService() {
    if (!svcForm.name.trim()) return;
    const svc: Service = {
      id: uid(),
      name: svcForm.name,
      description: svcForm.description,
      status: svcForm.status,
      uptimePct: 100,
      lastChecked: new Date().toISOString(),
    };
    setServices(s => [...s, svc]);
    setSvcForm({ name: '', description: '', status: 'operational' });
    setShowAdd(false);
  }

  function updateStatus(id: string, status: StatusLevel) {
    setServices(s => s.map(svc => svc.id === id ? { ...svc, status } : svc));
  }

  function removeService(id: string) {
    setServices(s => s.filter(svc => svc.id !== id));
  }

  async function handleSave() {
    if (!username.trim()) return;
    setSaving(true);
    setError('');
    try {
      let currentPage = page;
      if (!currentPage) {
        currentPage = await createStatusPage(username, displayName || username);
        setPage(currentPage);
      }
      await updateServices(currentPage.id, services);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateIncident() {
    if (!incForm.title.trim() || !incForm.message.trim() || !page) return;
    try {
      await createIncident(page.id, incForm.title, incForm.severity, incForm.message);
      setIncForm({ title: '', severity: 'minor', message: '' });
      setShowIncident(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create incident.');
    }
  }

  async function handleResolve(incidentId: string) {
    try {
      await updateIncident(incidentId, { status: 'resolved', message: 'Issue resolved.' });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve incident.');
    }
  }

  async function handleDeleteIncident(incidentId: string) {
    try {
      await deleteIncident(incidentId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete incident.');
    }
  }

  if (loading) {
    return (
      <div className="container-app py-10 flex items-center justify-center">
        <span className="text-[var(--color-text-dim)] text-sm">$ loading status page...</span>
      </div>
    );
  }

  return (
    <div className="container-app py-10 space-y-8 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-neon-orange)] transition-colors">
          <RiArrowLeftLine size={13} /> $ ls /status
        </Link>
      </div>

      <div>
        <div className="text-xs text-[var(--color-text-muted)]"><span className="text-[var(--color-neon-green)]">$</span> devstatus manage</div>
        <h1 className="text-3xl font-bold mt-2">Manage Page<span className="caret" /></h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Configure your public status page.</p>
      </div>

      {error && (
        <div className="text-xs text-[var(--color-neon-red)] border border-[rgba(255,77,77,0.3)] rounded p-3">
          {error}
        </div>
      )}

      {/* Page settings */}
      <div className="term-card">
        <div className="term-card-header" style={{ color: 'var(--color-neon-orange)' }}>
          <span>// page settings</span>
        </div>
        <div className="term-card-body space-y-3">
          <div>
            <label className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-widest block mb-1.5">display name</label>
            <input className="w-full" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="My Project" />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-widest block mb-1.5">username / slug</label>
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text-dim)] text-sm shrink-0">localhost:3007/</span>
              <input className="flex-1" value={username} onChange={e => setUsername(e.target.value)} placeholder="myproject" disabled={!!page} />
            </div>
          </div>
          {page && (
            <a href={`/${username}`} target="_blank"
              className="flex items-center gap-1 text-xs text-[var(--color-neon-cyan)] hover:underline">
              <RiExternalLinkLine size={11} /> preview public page →
            </a>
          )}
        </div>
      </div>

      {/* Services */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-widest">// services</div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 text-xs text-[var(--color-neon-orange)] hover:underline">
            <RiAddLine size={12} /> add service
          </button>
        </div>

        {showAdd && (
          <div className="term-card" style={{ borderColor: 'rgba(255,140,66,0.4)' }}>
            <div className="term-card-header" style={{ color: 'var(--color-neon-orange)' }}>
              <span>$ new service</span>
              <button onClick={() => setShowAdd(false)} className="text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)]">✕</button>
            </div>
            <div className="term-card-body space-y-3">
              <input className="w-full" placeholder="Service name" value={svcForm.name} onChange={e => setSvcForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              <input className="w-full" placeholder="Description" value={svcForm.description} onChange={e => setSvcForm(f => ({ ...f, description: e.target.value }))} />
              <select className="w-full" value={svcForm.status} onChange={e => setSvcForm(f => ({ ...f, status: e.target.value as StatusLevel }))}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={addService}
                  className="flex-1 py-2 text-sm font-semibold rounded border border-[var(--color-neon-orange)] text-[var(--color-neon-orange)] hover:bg-[rgba(255,140,66,0.1)] transition-colors">
                  add
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-sm rounded border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors">
                  cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {services.length === 0 && !showAdd && (
          <div className="term-card text-center py-8 text-[var(--color-text-dim)] text-sm">
            No services yet. Add one above.
          </div>
        )}

        {services.map(svc => (
          <div key={svc.id} className="term-card group">
            <div className="flex items-center gap-3 p-4">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[svc.status] }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--color-text)]">{svc.name}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{svc.description}</div>
              </div>
              <select value={svc.status} onChange={e => updateStatus(svc.id, e.target.value as StatusLevel)}
                className="text-xs py-1 px-2" style={{ color: STATUS_COLORS[svc.status] }}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <button onClick={() => removeService(svc.id)}
                className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] opacity-0 group-hover:opacity-100 transition-all">
                <RiDeleteBinLine size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Active incidents */}
      {page && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-widest">// incidents</div>
            <button onClick={() => setShowIncident(true)}
              className="flex items-center gap-1 text-xs text-[var(--color-neon-amber)] hover:underline">
              <RiErrorWarningLine size={12} /> report incident
            </button>
          </div>

          {showIncident && (
            <div className="term-card" style={{ borderColor: 'rgba(255,181,71,0.4)' }}>
              <div className="term-card-header" style={{ color: 'var(--color-neon-amber)' }}>
                <span>$ new incident</span>
                <button onClick={() => setShowIncident(false)} className="text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)]">✕</button>
              </div>
              <div className="term-card-body space-y-3">
                <input className="w-full" placeholder="Incident title" value={incForm.title} onChange={e => setIncForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                <select className="w-full" value={incForm.severity} onChange={e => setIncForm(f => ({ ...f, severity: e.target.value as Incident['severity'] }))}>
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                </select>
                <textarea className="w-full h-20 resize-none" placeholder="Initial update message..." value={incForm.message} onChange={e => setIncForm(f => ({ ...f, message: e.target.value }))} />
                <div className="flex gap-2">
                  <button onClick={handleCreateIncident}
                    className="flex-1 py-2 text-sm font-semibold rounded border border-[var(--color-neon-amber)] text-[var(--color-neon-amber)] hover:bg-[rgba(255,181,71,0.1)] transition-colors">
                    create incident
                  </button>
                  <button onClick={() => setShowIncident(false)}
                    className="px-4 py-2 text-sm rounded border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors">
                    cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {incidents.filter(i => i.status !== 'resolved').length === 0 && !showIncident && (
            <div className="term-card text-center py-6 text-[var(--color-text-dim)] text-sm">
              No active incidents.
            </div>
          )}

          {incidents.filter(i => i.status !== 'resolved').map(inc => (
            <div key={inc.id} className="term-card" style={{ borderColor: 'rgba(255,181,71,0.3)' }}>
              <div className="term-card-header" style={{ color: 'var(--color-neon-amber)' }}>
                <span className="flex items-center gap-2"><RiErrorWarningLine size={13} /> {inc.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded border border-[rgba(255,181,71,0.3)]">{inc.status}</span>
              </div>
              <div className="term-card-body flex gap-2 justify-end">
                <button onClick={() => handleResolve(inc.id)}
                  className="text-xs px-3 py-1 rounded border border-[var(--color-neon-green)] text-[var(--color-neon-green)] hover:bg-[rgba(0,255,136,0.08)] transition-colors">
                  resolve
                </button>
                <button onClick={() => handleDeleteIncident(inc.id)}
                  className="text-xs px-3 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-neon-red)] hover:text-[var(--color-neon-red)] transition-colors">
                  delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleSave} disabled={saving || saved}
        className="w-full py-3 text-sm font-semibold rounded border transition-colors disabled:opacity-60"
        style={{
          borderColor: saved ? 'var(--color-neon-green)' : 'var(--color-neon-orange)',
          color: saved ? 'var(--color-neon-green)' : 'var(--color-neon-orange)',
          background: saved ? 'rgba(0,255,136,0.08)' : 'transparent',
        }}>
        {saved ? '✓ saved' : saving ? 'saving...' : page ? '$ devstatus publish' : '$ devstatus init'}
      </button>
    </div>
  );
}
