import { createClient } from './supabase';
import type { StatusLevel, Service, Incident } from './status';

export type { StatusLevel, Service, Incident };

export type StatusPage = {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  services: Service[];
  created_at: string;
  updated_at: string;
};

const LS_PAGE_KEY = 'devstatus_page';
const LS_INC_KEY = 'devstatus_incidents';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

function lsGetPage(): StatusPage | null {
  try { return JSON.parse(localStorage.getItem(LS_PAGE_KEY) ?? 'null'); } catch { return null; }
}
function lsGetInc(): Incident[] {
  try { return JSON.parse(localStorage.getItem(LS_INC_KEY) ?? '[]'); } catch { return []; }
}

export async function getAllStatusPages(): Promise<StatusPage[]> {
  const sb = createClient();
  const { data } = await sb.from('status_pages').select('*').order('created_at', { ascending: false });
  return (data ?? []).map(r => ({ ...r, services: r.services ?? [] }));
}

export async function getStatusPage(username: string): Promise<{ page: StatusPage; incidents: Incident[] } | null> {
  const sb = createClient();
  const { data: page } = await sb
    .from('status_pages')
    .select('*')
    .eq('username', username)
    .single();
  if (!page) return null;
  const { data: incidents } = await sb
    .from('incidents')
    .select('*')
    .eq('status_page_id', page.id)
    .order('created_at', { ascending: false })
    .limit(20);
  return {
    page: { ...page, services: page.services ?? [] },
    incidents: (incidents ?? []).map(r => ({ ...r, updates: r.updates ?? [] })),
  };
}

export async function getMyStatusPage(): Promise<{ page: StatusPage; incidents: Incident[] } | null> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    const page = lsGetPage();
    return page ? { page, incidents: lsGetInc() } : null;
  }
  const { data: page } = await sb
    .from('status_pages')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (!page) return null;
  const { data: incidents } = await sb
    .from('incidents')
    .select('*')
    .eq('status_page_id', page.id)
    .order('created_at', { ascending: false });
  return {
    page: { ...page, services: page.services ?? [] },
    incidents: (incidents ?? []).map(r => ({ ...r, updates: r.updates ?? [] })),
  };
}

export async function createStatusPage(username: string, display_name: string): Promise<StatusPage> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    const page: StatusPage = { id: uid(), user_id: 'local', username, display_name, services: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    localStorage.setItem(LS_PAGE_KEY, JSON.stringify(page));
    return page;
  }
  const { data, error } = await sb
    .from('status_pages')
    .insert({ user_id: user.id, username, display_name, services: [] })
    .select()
    .single();
  if (error) throw error;
  return { ...data, services: [] };
}

export async function updateServices(pageId: string, services: Service[]): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    const page = lsGetPage();
    if (page) localStorage.setItem(LS_PAGE_KEY, JSON.stringify({ ...page, services }));
    return;
  }
  await sb.from('status_pages').update({ services }).eq('id', pageId).eq('user_id', user.id);
}

export async function createIncident(pageId: string, title: string, severity: Incident['severity'], message: string): Promise<Incident> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const firstUpdate = { time: new Date().toISOString(), message };
  if (!user) {
    const inc: Incident = { id: uid(), title, status: 'investigating', severity, createdAt: new Date().toISOString(), updates: [firstUpdate] };
    lsGetInc(); // read first
    localStorage.setItem(LS_INC_KEY, JSON.stringify([inc, ...lsGetInc()]));
    return inc;
  }
  const { data, error } = await sb
    .from('incidents')
    .insert({ status_page_id: pageId, title, severity, status: 'investigating', updates: [firstUpdate] })
    .select()
    .single();
  if (error) throw error;
  return { ...data, updates: data.updates ?? [] };
}

export async function updateIncident(incidentId: string, patch: { status?: Incident['status']; message?: string }): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    const incs = lsGetInc();
    const updated = incs.map(i => {
      if (i.id !== incidentId) return i;
      const updates = patch.message ? [...i.updates, { time: new Date().toISOString(), message: patch.message }] : i.updates;
      return { ...i, ...(patch.status ? { status: patch.status } : {}), updates, ...(patch.status === 'resolved' ? { resolvedAt: new Date().toISOString() } : {}) };
    });
    localStorage.setItem(LS_INC_KEY, JSON.stringify(updated));
    return;
  }
  const { data: current } = await sb.from('incidents').select('updates').eq('id', incidentId).single();
  const updates = patch.message
    ? [...(current?.updates ?? []), { time: new Date().toISOString(), message: patch.message }]
    : (current?.updates ?? []);
  await sb.from('incidents').update({
    ...(patch.status ? { status: patch.status } : {}),
    updates,
    ...(patch.status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}),
  }).eq('id', incidentId);
}

export async function deleteIncident(incidentId: string): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) { localStorage.setItem(LS_INC_KEY, JSON.stringify(lsGetInc().filter(i => i.id !== incidentId))); return; }
  await sb.from('incidents').delete().eq('id', incidentId);
}
