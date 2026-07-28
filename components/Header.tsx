'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bookmark, Compass, Home, Menu, Mic, Search, Tv, X } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'होम', icon: Home },
  { href: '/browse', label: 'सभी सीरीज़', icon: Compass },
  { href: '/genres', label: 'श्रेणियाँ', icon: Tv },
  { href: '/watchlist', label: 'मेरी लिस्ट', icon: Bookmark },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, hydrated } = useWatchlist();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled
            ? 'border-b border-line/80 bg-ink/85 backdrop-blur-xl'
            : 'bg-gradient-to-b from-ink/90 to-transparent',
        )}
      >
        <div className="container-page flex h-16 items-center gap-4 sm:h-[68px]">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
            aria-label="एनिमे हिंदी डब — होम"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-neon">
              <Mic size={15} className="text-white" />
            </span>
            <span className="hidden text-base font-black leading-tight tracking-tight sm:block">
              एनिमे<span className="text-accent">हिंदी</span>डब
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {NAV.map(({ href, label }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'text-white' : 'text-muted hover:text-white',
                  )}
                >
                  {label}
                  {href === '/watchlist' && hydrated && count > 0 && (
                    <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold">
                      {count}
                    </span>
                  )}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}
          </nav>

          <form onSubmit={submit} className="ml-auto hidden max-w-xs flex-1 md:block">
            <div className="group flex items-center gap-2 rounded-xl border border-line bg-panel/70 px-3 py-2 transition-colors focus-within:border-accent/70">
              <Search
                size={16}
                className="shrink-0 text-muted transition-colors group-focus-within:text-accent"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="एनिमे खोजें..."
                aria-label="एनिमे खोजें"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link
              href="/search"
              aria-label="खोजें"
              className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-panel/70 text-muted transition-colors hover:text-white md:hidden"
            >
              <Search size={17} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="मेन्यू"
              aria-expanded={open}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-panel/70 text-white transition-colors hover:border-accent lg:hidden"
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
            <button type="button" className="btn-primary hidden px-4 py-2 text-xs sm:inline-flex">
              साइन इन
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />
        <nav
          className={cn(
            'absolute right-0 top-0 h-full w-[78%] max-w-xs border-l border-line bg-surface p-5 pt-20 transition-transform duration-300',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    active
                      ? 'bg-accent/15 text-white'
                      : 'text-muted hover:bg-white/5 hover:text-white',
                  )}
                >
                  <Icon size={18} />
                  {label}
                  {href === '/watchlist' && hydrated && count > 0 && (
                    <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          <button type="button" className="btn-primary mt-6 w-full">
            साइन इन करें
          </button>
        </nav>
      </div>
    </>
  );
}
