'use client';

import Link from 'next/link';
import { use, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Home, LogOut, Menu, X } from 'lucide-react';

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="og-h" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="60%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      {/* Ribbon top-left to bottom-right */}
      <path d="M4 6 L4 12 L22 28 L28 28 L28 22 L10 6 Z" fill="url(#og-h)" />
      {/* Ribbon top-right column */}
      <path d="M20 6 L28 6 L28 14 L24 14 L24 10 L20 10 Z" fill="url(#og-h)" opacity="0.85" />
      {/* Ribbon bottom-left column */}
      <path d="M4 22 L8 22 L8 26 L12 26 L12 30 L4 30 Z" fill="url(#og-h)" opacity="0.85" />
      {/* Speed lines */}
      <line x1="30" y1="11" x2="35" y2="11" stroke="#fb923c" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="30" y1="16" x2="36" y2="16" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="30" y1="21" x2="35" y2="21" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <Button asChild className="rounded-full text-sm px-4 py-2">
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <LogoIcon className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">Inference Optimizer</span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-orange-500 uppercase">AI Inference Gateway</span>
          </div>
        </Link>

        <div className="flex items-center gap-5">
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600">
            <Link href="/benchmarks" className="hover:text-gray-900 transition-colors">Benchmarks</Link>
            <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          </nav>
          <Suspense fallback={<div className="h-9 w-9" />}>
            <UserMenu />
          </Suspense>
          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          <Link
            href="/benchmarks"
            className="block py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Benchmarks
          </Link>
          <Link
            href="/pricing"
            className="block py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>
          <div className="pt-2">
            <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
              <Button className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      {children}
    </section>
  );
}
