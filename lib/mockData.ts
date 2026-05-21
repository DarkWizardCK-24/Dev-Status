import type { StatusPage } from './status';

export const MOCK_PAGES: StatusPage[] = [
  {
    username: 'devuser',
    displayName: 'Dev Projects',
    services: [
      { id: 'api', name: 'API Server', description: 'REST API endpoints', status: 'operational', uptimePct: 99.97, lastChecked: new Date().toISOString() },
      { id: 'web', name: 'Web App', description: 'Main frontend application', status: 'operational', uptimePct: 99.94, lastChecked: new Date().toISOString() },
      { id: 'db', name: 'Database', description: 'PostgreSQL primary', status: 'operational', uptimePct: 99.99, lastChecked: new Date().toISOString() },
      { id: 'cdn', name: 'CDN', description: 'Static asset delivery', status: 'degraded', uptimePct: 98.2, lastChecked: new Date().toISOString() },
      { id: 'auth', name: 'Auth Service', description: 'Authentication & OAuth', status: 'operational', uptimePct: 99.95, lastChecked: new Date().toISOString() },
    ],
    incidents: [
      {
        id: 'inc-1',
        title: 'CDN latency spike in EU region',
        status: 'monitoring',
        severity: 'minor',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        updates: [
          { time: new Date(Date.now() - 2 * 3600000).toISOString(), message: 'Investigating elevated latency reports from EU users.' },
          { time: new Date(Date.now() - 1 * 3600000).toISOString(), message: 'Identified edge node issue. Rerouting traffic to backup nodes.' },
          { time: new Date(Date.now() - 30 * 60000).toISOString(), message: 'Performance improving. Continuing to monitor.' },
        ],
      },
    ],
  },
];

export function getMockPage(username: string): StatusPage | null {
  return MOCK_PAGES.find(p => p.username === username) ?? null;
}
