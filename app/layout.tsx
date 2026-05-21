import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { ECOSYSTEM } from '@/lib/ecosystem';

export const metadata: Metadata = {
  title: 'DevStatus — Project Status Pages',
  description: 'Public status pages for your dev projects.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: '64px', minHeight: '100vh' }}>{children}</main>
        <footer className="border-t border-[var(--color-border)] mt-16 py-8">
          <div className="container-app">
            <div className="text-xs text-[var(--color-text-dim)] mb-4">
              <span className="text-[var(--color-neon-green)]">$</span> devstatus — part of deveco ecosystem
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {ECOSYSTEM.map(app => (
                <a key={app.name} href={app.url} className="text-[10px] text-[var(--color-text-dim)] hover:text-[var(--color-neon-cyan)] transition-colors">
                  {app.name}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
