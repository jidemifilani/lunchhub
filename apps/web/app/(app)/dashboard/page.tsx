'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import Link from 'next/link';
import { ShoppingBag, ChefHat, Wallet, CalendarDays, TrendingUp, Clock } from 'lucide-react';

export default function DashboardPage() {
  const user = getUser?.();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [daily, setDaily] = useState<any>(null);

  useEffect(() => {
    api.orders.stats().then(setStats).catch(() => {});
    api.orders.list().then(o => setOrders(o.slice(0, 5))).catch(() => {});
    api.menu.daily().then(setDaily).catch(() => {});
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-orange-100 text-orange-800',
    READY: 'bg-green-100 text-green-800',
    COLLECTED: 'bg-gray-100 text-gray-600',
    CANCELLED: 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h1 className="text-3xl font-heading text-foreground">
          {greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-fg mt-1">Here's what's happening at the canteen today.</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in stagger-1">
        {[
          { label: 'Order Lunch', href: '/orders/new', icon: ShoppingBag, color: 'bg-primary text-white' },
          { label: 'Kitchen Queue', href: '/kitchen', icon: ChefHat, color: 'bg-accent text-white' },
          { label: 'Meal Planner', href: '/planner', icon: CalendarDays, color: 'bg-blue-600 text-white' },
          { label: 'My Wallet', href: '/wallet', icon: Wallet, color: 'bg-emerald-600 text-white' },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border
                       hover:shadow-md transition-all cursor-pointer group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} group-hover:scale-105 transition-transform`}>
              <Icon className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Today's stats */}
        <div className="md:col-span-1 space-y-3 animate-in stagger-2">
          <h2 className="text-lg font-heading text-foreground">Today's Activity</h2>
          {[
            { label: 'Orders placed', value: stats?._count ?? '—', icon: ShoppingBag },
            { label: 'Revenue (₦)', value: stats?._sum?.total ? `₦${Number(stats._sum.total).toLocaleString()}` : '—', icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{String(value)}</p>
                <p className="text-xs text-muted-fg">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Today's menu */}
        <div className="md:col-span-2 bg-card rounded-2xl border border-border p-5 animate-in stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading text-foreground">Today's Menu</h2>
            <Link href="/menu" className="text-xs text-primary hover:underline cursor-pointer">View all</Link>
          </div>
          {daily?.items?.length ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {daily.items.slice(0, 6).map(({ item }: any) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-background">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-fg">₦{Number(item.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-fg py-6 text-center">No menu published for today yet.</p>
          )}
        </div>
      </div>

      {/* Recent orders */}
      {orders.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 animate-in stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading text-foreground">Recent Orders</h2>
            <Link href="/orders" className="text-xs text-primary hover:underline cursor-pointer">View all</Link>
          </div>
          <div className="space-y-2">
            {orders.map(o => (
              <div key={o.id} className="flex items-center gap-4 py-2.5 border-b border-border last:border-0">
                <Clock className="w-4 h-4 text-muted-fg shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{o.orderNo}</p>
                  <p className="text-xs text-muted-fg">{o.user?.name} · {o.items?.length} item(s)</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[o.status] || 'bg-gray-100 text-gray-600'}`}>
                  {o.status}
                </span>
                <p className="text-sm font-semibold text-foreground shrink-0">₦{Number(o.total).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
