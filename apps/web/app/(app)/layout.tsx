'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, getUser, clearSession } from '@/lib/auth';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, ChefHat,
  CalendarDays, Truck, Wallet, Users, LogOut, Menu, X,
} from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/menu',         label: 'Menu',         icon: UtensilsCrossed },
  { href: '/orders/new',   label: 'Order Now',    icon: ShoppingBag },
  { href: '/kitchen',      label: 'Kitchen',      icon: ChefHat, roles: ['ADMIN','CANTEEN_STAFF','KITCHEN_STAFF'] },
  { href: '/planner',      label: 'Meal Planner', icon: CalendarDays },
  { href: '/deliveries',   label: 'Deliveries',   icon: Truck, roles: ['ADMIN','CANTEEN_STAFF'] },
  { href: '/wallet',       label: 'Wallet',       icon: Wallet },
  { href: '/users',        label: 'Users',        icon: Users, roles: ['ADMIN'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    setUser(getUser());
  }, [router]);

  function logout() {
    clearSession();
    router.replace('/login');
  }

  const links = NAV.filter(n => !n.roles || (user && n.roles.includes(user.role)));

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-card border-r border-border shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-heading text-xl text-foreground">LunchHub</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer',
                path.startsWith(href) && href !== '/dashboard'
                  ? 'bg-primary text-white'
                  : path === href
                    ? 'bg-primary text-white'
                    : 'text-muted-fg hover:bg-muted hover:text-foreground',
              )}>
              <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-fg truncate">{user?.role}</p>
            </div>
            <button onClick={logout} className="text-muted-fg hover:text-primary transition-colors cursor-pointer" aria-label="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-heading text-lg text-foreground">LunchHub</span>
        </div>
        <button onClick={() => setOpen(o => !o)} className="text-foreground cursor-pointer" aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-20 bg-black/30" onClick={() => setOpen(false)}>
          <aside className="absolute left-0 top-14 bottom-0 w-64 bg-card border-r border-border overflow-y-auto" onClick={e => e.stopPropagation()}>
            <nav className="px-3 py-4 space-y-0.5">
              {links.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer',
                    path === href ? 'bg-primary text-white' : 'text-muted-fg hover:bg-muted hover:text-foreground',
                  )}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t border-border">
              <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-fg hover:text-primary cursor-pointer">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
