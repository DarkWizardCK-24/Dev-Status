export type StatusLevel = 'operational' | 'degraded' | 'partial' | 'outage' | 'maintenance';

export type Service = {
  id: string;
  name: string;
  description: string;
  status: StatusLevel;
  uptimePct: number;
  lastChecked: string;
};

export type Incident = {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  createdAt: string;
  resolvedAt?: string;
  updates: { time: string; message: string }[];
};

export type StatusPage = {
  username: string;
  displayName: string;
  services: Service[];
  incidents: Incident[];
};

export const STATUS_COLORS: Record<StatusLevel, string> = {
  operational: '#00ff88',
  degraded: '#ffb547',
  partial: '#ff8c42',
  outage: '#ff3366',
  maintenance: '#00e5ff',
};

export const STATUS_LABELS: Record<StatusLevel, string> = {
  operational: 'Operational',
  degraded: 'Degraded Performance',
  partial: 'Partial Outage',
  outage: 'Major Outage',
  maintenance: 'Under Maintenance',
};

export function overallStatus(services: Service[]): StatusLevel {
  if (services.some(s => s.status === 'outage')) return 'outage';
  if (services.some(s => s.status === 'partial')) return 'partial';
  if (services.some(s => s.status === 'degraded')) return 'degraded';
  if (services.some(s => s.status === 'maintenance')) return 'maintenance';
  return 'operational';
}
