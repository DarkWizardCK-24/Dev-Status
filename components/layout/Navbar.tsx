'use client';
import Link from 'next/link';
import { useState } from 'react';
import { RiRadarLine, RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import AuthButton from '@/components/auth/AuthButton';

const links = [
  { href: '/', label: '~/status' },
  { href: '/manage', label: '~/manage' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b border-[var(--color-border)] bg-[rgba(5,7,15,0.7)]">
      <div className="container-app flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <RiRadarLine className="text-[var(--color-neon-orange)]" size={20} />
          <span className="font-bold">
            <span className="text-[var(--color-neon-orange)]">dev</span>
            <span className="text-[var(--color-neon-cyan)]">status</span>
            <span className="text-[var(--color-text-dim)]">.sh</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-neon-orange)] rounded transition-colors">
              {l.label}
            </Link>
          ))}
          <a href="http://localhost:3000" className="ml-2 px-3 py-1.5 text-xs border border-[var(--color-border)] rounded hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)] text-[var(--color-text-muted)] transition-colors">↗ DevFolio</a>
          <AuthButton />
        </nav>
        <button className="md:hidden text-[var(--color-text-muted)]" onClick={() => setOpen(v => !v)}>
          {open ? <RiCloseLine size={22} /> : <RiMenu3Line size={22} />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-6 py-3 text-sm text-[var(--color-text-muted)]">
              {l.label}
            </Link>
          ))}
          <a href="http://localhost:3000" onClick={() => setOpen(false)} className="block px-6 py-3 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-neon-cyan)]">↩ DevFolio</a>
        </nav>
      )}
    </header>
  );
}
